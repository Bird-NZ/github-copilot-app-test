# Social Sentiment Tracking Plan (World Mobile)

## Objective
Track ecosystem sentiment shifts early, separate real issues from noise, and link sentiment to technical/economic events.

## Data model (each mention)
- timestamp
- channel (X/Telegram/Discord/YouTube/Reddit/News)
- author_handle
- follower_tier (micro/mid/large)
- text
- entities_detected (WMT, WMTx, EarthNode, etc.)
- sentiment_score (-1 to +1)
- confidence
- engagement (likes/replies/reposts/views)
- narrative_tag (e.g., staking-yield, outage, token-migration, listing-rumor)
- rumor_flag (true/false)
- source_url

## Processing pipeline
1. Ingest mentions by keyword/entity dictionary.
2. Classify sentiment + narrative tag.
3. Weight by engagement and author influence.
4. De-duplicate cross-posts.
5. Roll up hourly/daily metrics.
6. Trigger alerts on spikes/negative shifts.

## Minimum viable dashboards
1. Sentiment Trend (7d/30d)
2. Mention Volume vs Price/Event timeline
3. Top Narratives (positive/negative)
4. Rumor Watchlist
5. Official-vs-community narrative divergence

## Practical alerting rules
- Alert A: Negative score < threshold for 3+ consecutive hours.
- Alert B: Mention volume spikes >2x baseline with neutral/negative bias.
- Alert C: High-engagement rumor appears without official confirmation.
- Alert D: Repeated confusion topic (e.g., WMT vs WMTx) crosses set volume.

## Integration with agent answers
When user asks "what's sentiment?", answer with:
1. Direction (improving/stable/worsening)
2. Main narratives (top 3)
3. Risk signals (rumor/confusion/escalation)
4. Confidence level + blind spots
