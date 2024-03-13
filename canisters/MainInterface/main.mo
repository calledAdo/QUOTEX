/*
  The Main Canister Interface that stores

  Assets
  Positions
  Quotes
  Pools canisterID
  liquidity ProviderID

  Note:Some functions in here are restricted to the admins or clearingHouse canister like

  Adding new Debt Pools
  ading positions
  removing Positions


*/

import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Error "mo:base/Error";
import Buffer "mo:base/Buffer";
import Int "mo:base/Int";
import Nat64 "mo:base/Nat64";
import Array "mo:base/Array";
import Nat32 "mo:base/Nat32";
import Time "mo:base/Time";

import XRC "../Interface/XRC";
import ICRC "../Interface/ICRC";
import PriceFeed "../PriceFeed/main";
import Pool "../Pool/main";
import LiquidityProvider "../LiquidityProvider/main";
import Types "Types";

shared ({ caller }) actor class Main(_priceFeed : Principal) = this {
  type ExchangeRate = XRC.ExchangeRate;

  type Token = ICRC.Token;

  type Asset = Types.Asset;

  type TokenDetails = Types.TokenDetails;

  type Quote = Types.Quote;

  type Pool = Pool.Pool;

  type OpenPositionParams = Types.OpenPositionParams;

  type ClosePositionParams = Types.ClosePositionParams;

  type Position = Types.Position;

  type LiquidityProvider = LiquidityProvider.LiquidityProvider;

  // A position type  buffer to loop through positions
  type PositionBuffer = HashMap.HashMap<Principal, Buffer.Buffer<Position>>;

  let assetsList = Buffer.Buffer<Asset>(1);
  let pools = Buffer.Buffer<Principal>(1);
  let providers = Buffer.Buffer<Principal>(3);

  let user_POSITIONS = HashMap.HashMap<Principal, Buffer.Buffer<Position>>(1, Principal.equal, Principal.hash);

  let token_POSITIONS = HashMap.HashMap<Principal, HashMap.HashMap<Principal, Buffer.Buffer<Position>>>(1, Principal.equal, Principal.hash);

  let token_QUOTES = HashMap.HashMap<Principal, HashMap.HashMap<Principal, Buffer.Buffer<Quote>>>(1, Principal.equal, Principal.hash);

  stable let priceFeed : PriceFeed.PriceFeed = actor (Principal.toText(_priceFeed));
  stable let admin : Principal = caller;
  stable let percentage_basis = Nat64.pow(10, 6);

  public query func getAssetsList() : async [Asset] {
    return Buffer.toArray(assetsList)
  };

  public query func getPools() : async [Principal] {
    return Buffer.toArray(pools)
  };
  public query func getUserPositions(user : Principal) : async [Position] {
    return _getUserPositions(user)
  };

  public query func getPairQuotes(base_asset_principal : Principal, quote_asset_principal : Principal) : async [Quote] {
    switch (token_QUOTES.get(base_asset_principal)) {
      case (?res) {
        switch (res.get(quote_asset_principal)) {
          case (?res) { Buffer.toArray(res) };
          case (_) { [] }
        }
      };
      case (_) { [] }
    }
  };

  public query func getPairPositions(base_asset_principal : Principal, quote_asset_principal : Principal) : async () {
    let quotes = switch (token_POSITIONS.get(base_asset_principal)) {
      case (?res) {
        switch (res.get(quote_asset_principal)) {
          case (?res) { Buffer.toArray(res) };
          case (_) { [] }
        }
      };
      case (_) { [] }
    }
  };

  public shared ({ caller }) func addAsset(asset : Asset) : async Nat {
    assert (isAllowed(caller));
    assetsList.add(asset);
    return assetsList.size() - 1
  };
  public shared ({ caller }) func addPool(poolPrincipal : Principal) : async Nat {
    assert (isAllowed(caller));
    pools.add(poolPrincipal);
    return pools.size() + 1
  };
  public shared ({ caller }) func setQuote(base_asset_principal : Principal, quote_asset_principal : Principal, _providerID : Nat, quote : Quote) : async Nat {
    let providerPrincipal : Principal = quote.liq_provider_id;
    let liq_Provider : LiquidityProvider = actor (Principal.toText(providerPrincipal));

    // Asserts caller is either liquidity provider pool admin
    assert (caller == (await liq_Provider.getAdmin()));
    let pair_quotes = switch (token_QUOTES.get(base_asset_principal)) {
      case (?res) { res };
      case (_) { throw Error.reject("Token Not Foumd") }; //prevents creation of quotes fro unknown tokens
    };

    let quotes = switch (pair_quotes.get(quote_asset_principal)) {
      case (?res) { res };
      case (_) { Buffer.Buffer<Quote>(1) }
    };

    quotes.add(quote);
    pair_quotes.put(quote_asset_principal, quotes);
    token_QUOTES.put(base_asset_principal, pair_quotes);
    return quotes.size() - 1;

  };

  public shared ({ caller }) func openPosition(params : OpenPositionParams) : async Position {
    //asserts all parameters are valid  check isOpenPositionValid to see full ilplemetation
    let res = await isOpenPositionValid(params);
    assert (res.valid == true);
    await _openPosition(caller, params, null, res.margin_fee)
  };

  public shared ({ caller }) func closePosition(params : ClosePositionParams) : async () {
    assert (await isClosePositionValid(caller, params));
    await _closePosition(caller, params)
  };

  private func _openPosition(caller : Principal, params : OpenPositionParams, subaccount : ?Blob, marginFee : Nat64) : async Position {
    let base_asset = _getAsset(params.base_asset_id);
    let quote_asset = _getAsset(params.quote_asset_id);
    let pool_principal : Principal = _getPool(params.pool_id);

    let quote = switch (_getQuote(base_asset.id, quote_asset.id, params.quote_id)) {
      case (#Ok(res)) { res };
      case (#Err(err)) { throw Error.reject("error found") }
    };

    //gets the current price rate based from the priceFeed contract
    let current_rate : ExchangeRate = await priceFeed.get_exchange_rate({
      base_asset = {
        symbol = base_asset.symbol;
        class_ = base_asset.class_
      };
      quote_asset = {
        symbol = quote_asset.symbol;
        class_ = quote_asset.class_
      };
      timestamp = null
    });

    //converst the picedecimal to Nat64 for calculation

    let price_decimal : Nat64 = Nat32.toNat64(current_rate.metadata.decimals);
    // calculate the equivalent amount of base_asset equalin value to the quote asset amount
    let exchange_value : Nat64 = (params.debt * current_rate.rate) / 10 ** price_decimal;

    //the value of quote
    let quote_value : Nat = _percent(Nat64.toNat(exchange_value), Nat64.toNat(quote.offer));

    //get the canister id of the debt_pool
    let debt_pool : Principal = _getPool(params.pool_id);

    // token transactions

    //transfer collateral in from caller(trader)
    let collateral_txIndex : Nat = await sendIn(quote_asset.id, Nat64.toNat(params.collateral_amount), caller, subaccount);

    //transfer in the quote value from the quote liquidity provider
    let liquidity_txIndex : Nat = await sendIn(quote_asset.id, quote_value, quote.liq_provider_id, null);

    //transfer in the debt amount from
    let debt_txIndex : Nat = await sendOut(base_asset.id, Nat64.toNat(params.debt), debt_pool, null, pool_principal : Principal, null);

    let position : Position = {
      amount_in = Nat64.toNat(params.collateral_amount + params.debt);
      asset_In = base_asset;
      asset_out = quote_asset;
      debt = params.debt;
      collateral = params.collateral_amount;
      debt_pool = debt_pool;
      marginFee = marginFee;
      timestamp = Time.now();
      owner = caller
    };

    //store position
    _storePosition(base_asset.id, position, caller);
    //remove Quote
    ignore {
      _removeQuote(base_asset.id, quote_asset.id, params.quote_id)
    };
    return position
  };

  private func _closePosition(caller : Principal, params : ClosePositionParams) : async () {
    let position : Position = switch (_getPositionByID(params.quote_asset.id, params.base_asset.id, params.position_id)) {
      case (#Ok(res)) { res };
      case (#Err(err)) { throw Error.reject(err) }
    };
    let quote = switch (_getQuote(params.base_asset.id, params.quote_asset.id, params.quote_id)) {
      case (#Ok(res)) { res };
      case (#Err(err)) { throw Error.reject("error found") }
    };

    let current_rate : ExchangeRate = await priceFeed.get_exchange_rate({
      base_asset = {
        symbol = position.asset_out.symbol;
        class_ = position.asset_out.class_
      };
      quote_asset = {
        symbol = position.asset_In.symbol;
        class_ = position.asset_In.class_
      };
      timestamp = null
    });
    let price_decimal : Nat = Nat32.toNat(current_rate.metadata.decimals);

    let equivalent = position.amount_in * Nat64.toNat(current_rate.rate) / 10 ** price_decimal;

    let quote_value = _percent(equivalent, Nat64.toNat(quote.offer));
    let current_time = Time.now();
    let fee = calculateMarginFee(current_time, position.timestamp, Nat64.toNat(position.debt), Nat64.toNat(position.marginFee));

    let liquidity_txIndex = await sendIn(position.asset_out.id, quote_value, quote.liq_provider_id, null);
    let amountout_txIndex = await sendOut(position.asset_In.id, position.amount_in, Principal.fromActor(this), null, quote.liq_provider_id, null);

    //special case of bad debt
    var total_debt = quote_value;
    var diff : Int = quote_value - total_debt;
    var pnl = 0;

    if (diff > 0) {
      total_debt := Nat64.toNat(position.debt) + fee;
      pnl := Int.abs(diff);
      ignore {
        //send pnl to trader
        await sendOut(position.asset_out.id, total_debt, Principal.fromActor(this), null, position.owner, null)
      }
    };

    let tx1 = await sendOut(position.asset_out.id, total_debt, Principal.fromActor(this), null, position.debt_pool, null);

    ignore {
      _removePosition(params.quote_asset.id, position, position.owner, params.position_id)
    };
    ignore {
      _removeQuote(position.asset_In.id, position.asset_out.id, params.quote_id)
    }
  };

  private func sendOut(_tokenPrincipal : Principal, amount : Nat, from : Principal, from_subaccount : ?Blob, to : Principal, to_subaccount : ?Blob) : async Nat {

    let token : Token = actor (Principal.toText(_tokenPrincipal));
    let fee = await token.icrc1_fee();
    let tx = await token.icrc2_transfer_from({
      spender_subaccount = null;
      from = { owner = from; subaccount = from_subaccount };
      to = { owner = to; subaccount = to_subaccount };
      amount = amount;
      fee = ?fee;
      memo = null;
      created_at_time = null
    });
    let result = switch (tx) {
      case (#Ok(num)) { return num };
      case (#Err(err)) { throw Error.reject("Token send out failed") }
    }
  };

  private func sendIn(_tokenPrincipal : Principal, amount : Nat, to : Principal, subaccount : ?Blob) : async Nat {
    let token : Token = actor (Principal.toText(_tokenPrincipal));

    let fee = await token.icrc1_fee();
    let tx = await token.icrc2_transfer_from({
      spender_subaccount = null;
      from = { owner = Principal.fromActor(this); subaccount = null };
      to = { owner = to; subaccount = subaccount };
      amount = amount;
      fee = ?fee;
      memo = null;
      created_at_time = null
    });
    let result = switch (tx) {
      case (#Ok(num)) { return num };
      case (#Err(err)) { throw Error.reject("Token send in Failed") }
    };

  };

  /* Removes a quote given its id

   `` can only be called by clearingHouse canister of the principal identity that set the Quote

   */
  private func _removeQuote(base_asset_principal : Principal, quote_asset_principal : Principal, _quoteID : Nat) : async {
    #Ok : Text;
    #Err : Text
  } {
    let quotes = switch (token_QUOTES.get(base_asset_principal)) {
      case (?res) { res };
      case (_) { return #Err("Token Quotes not found") }
    };

    //gets the pair quotes quote
    let pair_quotes : Buffer.Buffer<Quote> = switch (quotes.get(quote_asset_principal)) {
      case (?res) { res };
      case (_) { return #Err("Quote not Found") }
    };
    let quote = pair_quotes.get(_quoteID);

    /* checks that the principal assigned as admin of that liquidity provider canister is the one calling the function
          This can also be called by the admin principal id of this canister for quotes that

          `Have become too old
          `Tokens that have been removed

           */
    quotes.put(quote_asset_principal, pair_quotes);
    token_QUOTES.put(base_asset_principal, quotes);
    return #Ok("Done")
  };

  private func _storePosition(base_asset_principal : Principal, _position : Position, _user : Principal) : () {
    let token_positions = switch (token_POSITIONS.get(base_asset_principal)) {
      case (?res) { res };
      case (_) {
        HashMap.HashMap<Principal, Buffer.Buffer<Position>>(1, Principal.equal, Principal.hash)
      }
    };

    let token_user_positions = switch (token_positions.get(_user)) {
      case (?res) { res };
      case (_) { Buffer.Buffer<Position>(1) }
    };
    let all_user_positions : Buffer.Buffer<Position> = switch (user_POSITIONS.get(_user)) {
      case (?res) { res };
      case (_) { Buffer.Buffer<Position>(1) }
    };
    token_user_positions.add(_position);
    token_positions.put(_user, token_user_positions);

    token_POSITIONS.put(base_asset_principal, token_positions);

    //user personal positions

    all_user_positions.add(_position);
    user_POSITIONS.put(_user, all_user_positions)
  };

  private func _removePosition(base_asset_principal : Principal, _position : Position, _user : Principal, _positonID : Nat) : {
    #Ok : Text;
    #Err : Text
  } {

    let token_positions = switch (token_POSITIONS.get(base_asset_principal)) {
      case (?res) { res };
      case (_) { return #Err("Token Positions not found") }
    };

    let user_token_positions = switch (token_positions.get(_user)) {
      case (?res)(res);
      case (_) { return #Err("Position not found") }
    };

    let all_user_positions = switch (user_POSITIONS.get(_user)) {
      case (?res) { res };
      case (_) { return #Err("User position not found") }
    };

    let user_position_id = switch (_getPositionID(base_asset_principal, _position, user_POSITIONS)) {
      case (#Ok(res)) { res };
      case (#Err(err)) {
        return #Err("No user position with such id")
      }
    };
    ignore {
      let removedPosition = user_token_positions.remove(_positonID);
      all_user_positions.remove(user_position_id)
    };
    token_positions.put(_user, user_token_positions);
    token_POSITIONS.put(base_asset_principal, token_positions);
    user_POSITIONS.put(_user, all_user_positions);
    return #Ok("Done")

  };

  private func isOpenPositionValid(params : OpenPositionParams) : async {
    valid : Bool;
    margin_fee : Nat64
  } {
    let base_asset = _getAsset(params.base_asset_id);
    let quote_asset = _getAsset(params.quote_asset_id);
    let quote = switch (_getQuote(base_asset.id, quote_asset.id, params.quote_id)) {
      case (#Ok(res)) { res };
      case (#Err(err)) { throw Error.reject("error found") }
    };
    let pool_principal = _getPool(params.pool_id);
    let pool : Pool.Pool = actor (Principal.toText(pool_principal));

    //gets the token details associated with that token in the pool provifding the leverage
    let token_details = await pool.getTokenDetails(base_asset.id);

    return {
      valid = token_details.is_allowed // checks if token is an allowed asset by the pool providing levarage

      //checks that maximum debt for trading that token is not exceed
      and params.debt <= token_details.max_debt and params.collateral_amount >= token_details.min_collateral and inRange(Nat64.toNat(params.debt), Nat64.toNat(quote.range.min), Nat64.toNat(quote.range.max));

      // returns margin fee
      margin_fee = token_details.margin_fee
    };

  };

  private func isClosePositionValid(caller : Principal, params : ClosePositionParams) : async Bool {

    let position : Position = let token_positions = switch (token_POSITIONS.get(params.quote_asset.id)) {
      case (?res) {
        switch (res.get(params.base_asset.id)) {
          case (?x) { (x.get(params.position_id)) };
          case (_) { throw Error.reject("Not found") }
        }
      };
      case (_) { throw Error.reject("Position not found") }
    };

    let quote = switch (_getQuote(params.base_asset.id, params.quote_asset.id, params.quote_id)) {
      case (#Ok(res)) { res };
      case (#Err(err)) { throw Error.reject("error found") }
    };
    let pool : Pool = actor (Principal.toText(position.debt_pool));
    let allowed = caller == position.owner or (await pool.isLiquidator(caller));

    return (inRange(position.amount_in, Nat64.toNat(quote.range.min), Nat64.toNat(quote.range.max)) and allowed and params.quote_asset == position.asset_In and params.quote_asset == position.asset_out)
  };

  private func _getPositionByID(base_asset_principal : Principal, quote_asset_principal : Principal, _positionID : Nat) : {
    #Ok : Position;
    #Err : Text
  } {
    let token_positions = switch (token_POSITIONS.get(base_asset_principal)) {
      case (?res) {
        switch (res.get(quote_asset_principal)) {
          case (?x) { return #Ok(x.get(_positionID)) };
          case (_) { return #Err("Not found") }
        }
      };
      case (_) { return #Err("Position not found") }
    }
  };

  private func _getPositionID(base_asset_principal : Principal, _position : Position, positionBuffer : PositionBuffer) : {
    #Ok : Nat;
    #Err : Text
  } {
    let token_positions = switch (positionBuffer.get(base_asset_principal)) {
      case (?res)(res);
      case (_) { return #Err("Token Positions not found") }
    };
    var counter = 0;
    label looping for (position in token_positions.vals()) {
      if (position == _position) {
        break looping
      };
      counter += 1
    };
    return #Ok(counter)

  };
  private func _getUserPositions(user : Principal) : [Position] {
    switch (user_POSITIONS.get(user)) {
      case (?res) { Buffer.toArray(res) };
      case (_) { [] }
    }
  };

  private func _getQuote(base_asset_principal : Principal, quote_asset_principal : Principal, index : Nat) : {
    #Ok : Quote;
    #Err : Text
  } {
    let token_quotes = switch (token_QUOTES.get(base_asset_principal)) {
      case (?pair_quotes) {
        switch (pair_quotes.get(quote_asset_principal)) {
          case (?res) { return #Ok(res.get(index)) };
          case (_) { return #Err("Quote not found") }
        }
      };
      case (_) { #Err("Not found") }
    }
  };

  private func _getPool(id : Nat) : Principal {
    return pools.get(id)
  };
  private func _getAsset(id : Nat) : Asset {
    return assetsList.get(id)
  };

  private func isAllowed(caller : Principal) : Bool {
    return caller == admin
  };

  private func calculateMarginFee(starttime : Int, current_time : Int, amount : Nat, fee : Nat) : Nat {
    let duration : Int = current_time - starttime;
    let interval : Int = switch (duration / 3600 >= 1) {
      case (true) { duration / 3600 };
      case (false) { 1 }
    };
    var fee = 0;
    let counter = 0;
    while (counter < interval) {
      fee := amount - _percent(amount, fee)
    };

    return fee
  };

  //gets the y percent of x where y is the intended percentage *  100_000 ,
  private func _percent(x : Nat, y : Nat) : Nat {
    // product must be divided by 100_000 since y is multiple of 100_000
    return (x * y) / Nat64.toNat(percentage_basis)
  };

  private func inRange(x : Nat, min : Nat, max : Nat) : Bool {
    return (x <= max and x >= min)
  }
}
