#!/usr/bin/env python3
"""
Robust weather fetcher for NZ use-cases.
- Tries location-name geocoding and/or explicit lat/lon
- Pulls from Open-Meteo forecast endpoint
- Pulls from wttr.in current+forecast endpoint
- Retries transient failures with short backoff
- Emits a compact confidence + freshness summary

Usage:
  python3 data/weather_robust.py --location "Whatawhata"
  python3 data/weather_robust.py --lat -37.80 --lon 175.11
"""

from __future__ import annotations
import argparse
import datetime as dt
import json
import time
import urllib.parse
import urllib.request
from zoneinfo import ZoneInfo
from typing import Any, Dict, Optional, Tuple

TIMEOUT = 10


def fetch_json(url: str, retries: int = 3, backoff: float = 0.8) -> Dict[str, Any]:
    last_err = None
    for i in range(retries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "HAL-weather-robust/1.0"})
            with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
                return json.loads(r.read().decode("utf-8"))
        except Exception as e:
            last_err = e
            if i < retries - 1:
                time.sleep(backoff * (i + 1))
    raise RuntimeError(f"Fetch failed after retries: {url} :: {last_err}")


def geocode_open_meteo(name: str) -> Optional[Tuple[float, float, str]]:
    q = urllib.parse.quote(name)
    url = f"https://geocoding-api.open-meteo.com/v1/search?name={q}&count=1&language=en&format=json"
    data = fetch_json(url)
    results = data.get("results") or []
    if not results:
        return None
    r = results[0]
    lat = r.get("latitude")
    lon = r.get("longitude")
    label = ", ".join([p for p in [r.get("name"), r.get("admin1"), r.get("country_code")] if p])
    if lat is None or lon is None:
        return None
    return float(lat), float(lon), label


def get_open_meteo(lat: float, lon: float) -> Dict[str, Any]:
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m,weather_code",
        "daily": "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
        "timezone": "Pacific/Auckland",
        "forecast_days": 3,
    }
    qs = urllib.parse.urlencode(params)
    url = f"https://api.open-meteo.com/v1/forecast?{qs}"
    return fetch_json(url)


def get_wttr(location: str) -> Dict[str, Any]:
    q = urllib.parse.quote(location)
    url = f"https://wttr.in/{q}?format=j1"
    return fetch_json(url)


def parse_iso(s: Optional[str]) -> Optional[dt.datetime]:
    if not s:
        return None
    try:
        return dt.datetime.fromisoformat(s)
    except Exception:
        return None


def freshness_minutes(ts: Optional[dt.datetime]) -> Optional[int]:
    if not ts:
        return None
    if ts.tzinfo is None:
        ts = ts.replace(tzinfo=ZoneInfo("Pacific/Auckland"))
    now = dt.datetime.now(dt.timezone.utc).astimezone(ts.tzinfo)
    delta = now - ts
    return int(delta.total_seconds() // 60)


def confidence_score(om_ok: bool, wt_ok: bool, om_fresh: Optional[int], wt_fresh: Optional[int]) -> int:
    score = 0
    if om_ok:
        score += 45
    if wt_ok:
        score += 35
    if om_fresh is not None:
        score += 10 if om_fresh <= 60 else 5
    if wt_fresh is not None:
        score += 10 if wt_fresh <= 60 else 5
    return min(score, 100)


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--location", default="Whatawhata")
    p.add_argument("--lat", type=float)
    p.add_argument("--lon", type=float)
    args = p.parse_args()

    loc_label = args.location
    lat, lon = args.lat, args.lon

    if lat is None or lon is None:
        geo = geocode_open_meteo(args.location)
        if geo:
            lat, lon, loc_label = geo

    om_data = None
    wt_data = None
    om_err = None
    wt_err = None

    if lat is not None and lon is not None:
        try:
            om_data = get_open_meteo(lat, lon)
        except Exception as e:
            om_err = str(e)

    try:
        wt_data = get_wttr(args.location)
    except Exception as e:
        wt_err = str(e)

    om_ok = om_data is not None
    wt_ok = wt_data is not None

    om_time = None
    om_temp = None
    om_precip = None
    if om_ok:
        cur = om_data.get("current", {})
        om_time = parse_iso(cur.get("time"))
        om_temp = cur.get("temperature_2m")
        om_precip = cur.get("precipitation")

    wt_time = None
    wt_temp = None
    wt_desc = None
    if wt_ok:
        cc = (wt_data.get("current_condition") or [{}])[0]
        wt_temp = cc.get("temp_C")
        wt_desc = ((cc.get("weatherDesc") or [{}])[0]).get("value")
        # wttr provides localObsDateTime like '2026-02-19 05:24 PM'
        lodt = cc.get("localObsDateTime")
        if lodt:
            try:
                wt_time = dt.datetime.strptime(lodt, "%Y-%m-%d %I:%M %p")
                wt_time = wt_time.replace(tzinfo=dt.timezone(dt.timedelta(hours=13)))
            except Exception:
                wt_time = None

    om_fresh = freshness_minutes(om_time)
    wt_fresh = freshness_minutes(wt_time)
    conf = confidence_score(om_ok, wt_ok, om_fresh, wt_fresh)

    out = {
        "location": loc_label,
        "lat": lat,
        "lon": lon,
        "confidence": conf,
        "sources": {
            "open_meteo": {
                "ok": om_ok,
                "temp_c": om_temp,
                "precip_mm": om_precip,
                "obs_time": om_time.isoformat() if om_time else None,
                "freshness_min": om_fresh,
                "error": om_err,
            },
            "wttr": {
                "ok": wt_ok,
                "temp_c": wt_temp,
                "condition": wt_desc,
                "obs_time": wt_time.isoformat() if wt_time else None,
                "freshness_min": wt_fresh,
                "error": wt_err,
            },
        },
        "summary": None,
    }

    if om_ok or wt_ok:
        temp = om_temp if om_temp is not None else wt_temp
        cond = wt_desc if wt_desc else "conditions available"
        out["summary"] = f"{loc_label}: {temp}°C, {cond}. Confidence {conf}/100."
    else:
        out["summary"] = f"{loc_label}: unable to fetch weather from both providers."

    print(json.dumps(out, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
