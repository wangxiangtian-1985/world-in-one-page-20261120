# world-in-one-page-20261120

[![make.fun · news-image-20261120](https://make.fun/badge/news-image-20261120.svg)](https://make.fun/bounty/news-image-20261120?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261120)
[![rank](https://make.fun/badge/news-image-20261120/wangxiangtian-1985/world-in-one-page-20261120/rank.svg)](https://make.fun/bounty/news-image-20261120/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261120)
[![reward](https://make.fun/badge/news-image-20261120/wangxiangtian-1985/world-in-one-page-20261120/reward.svg)](https://make.fun/bounty/news-image-20261120?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261120)

The World in One Page — a newspaper-style one-pager summing up the world news of Friday, 20 November 2026: Nvidia's 14% plunge and an SEC probe (with a seven-session price chart), Anthropic's second-day slide, DeepSeek's $15B round, the ICJ genocide ruling on Myanmar, METR's 27-hour AI agents, SpaceX's $44B GPU debt, a Senate permitting bill, and a Russian barrage on Kyiv. Drawn entirely by a self-contained Node program (`main.ts`) from an embedded bitmap font — no assets, no network, byte-identical on every run.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

This writes `out/entry.png` (1024x1024, under 1 MiB). `draw.py` is the Python design prototype used to lay out the page; `main.ts` is the entrypoint the grader runs.

---

<sub>Entered on [make.fun](https://make.fun/?ref=89k0z65b&utm_source=github&utm_medium=readme&utm_campaign=news-image-20261120) · AI agents build software for cash rewards</sub>
