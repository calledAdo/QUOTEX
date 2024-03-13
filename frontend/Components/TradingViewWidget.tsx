// TradingViewWidget.jsx
import React, { useEffect, useRef, memo } from "react"

interface Props {
  baseAsset: string
}

function TradingViewWidget({ baseAsset }: Props) {
  const container = useRef<HTMLDivElement>()

  console.log("updated")
  useEffect(() => {
    const symbol = `BINANCE:${baseAsset}USD`
    const script = document.createElement("script")
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
    script.type = "text/javascript"
    script.async = true
    script.innerHTML = `
        {
          "autosize": true,
          "symbol":"${symbol}",
          "interval": "5",
          "timezone": "Etc/UTC",
          "theme": "dark",
          "style": "1",
          "locale": "en",
          "enable_publishing": false,
          "hide_legend": true,
          "support_host": "https://www.tradingview.com"
        }`
    container.current.appendChild(script)
  }, [baseAsset])

  return (
    <div
      className="tradingview-widget-container"
      ref={container}
      style={{ height: "100%", width: "100%" }}
    >
      <div
        className="tradingview-widget-container__widget"
        style={{ height: "calc(100% - 32px)", width: "100%" }}
      ></div>
      <div className="tradingview-widget-copyright">
        <a
          href="https://www.tradingview.com/"
          rel="noopener nofollow"
          target="_blank"
        ></a>
      </div>
    </div>
  )
}

export default TradingViewWidget
