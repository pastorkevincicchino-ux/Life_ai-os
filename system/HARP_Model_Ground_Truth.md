# HARP Model Ground Truth

This document serves as the definitive and immutable record of the correct Gemini model names for use with the `google-generativeai` library, specifically within the deployment environment as of June 2024.

## The Ground Truth

After extensive debugging and a "Satellite Scan" of the live deployment environment, the following model names were confirmed to be the only ones that resolve correctly with the `v1beta` API version.

- **Primary Pro Model:** `gemini-2.5-pro`
- **Primary Flash Model:** `gemini-2.5-flash`

## Context and History

Previous attempts using other model name variations resulted in `404 Not Found` errors. These incorrect variations included:
- `gemini-1.5-pro-latest`
- `gemini-1.5-flash-latest`
- `models/gemini-1.5-pro-latest`
- `gemini-pro`
- `gemini-1.0-pro`

**Conclusion:** The `v1beta` API version used in the deployment environment requires the specific, non-suffixed model names listed above. This truth is considered foundational for the HARP (Holy Automated Reinforcement Protocol) system.
