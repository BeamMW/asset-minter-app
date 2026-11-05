#  Confidential Asset Minter

Front end for the Beam Asset Minter decentralized application

Follow the [Developing Beam dApp UI](https://beam.mw/en/docs/dev/developing-beam-dapp-ui) guide to get started with Beam Decentralized Application development

![image](https://github.com/BeamMW/asset-minter-app/assets/37414225/e8216b4b-6e12-4cb9-9fb1-bd2aa6c790e7)

## Asset precision

Confidential Assets use 8 decimal places in Beam wallet amounts: one whole asset
unit is 100,000,000 smallest units. The creation form displays this precision as
fixed and emits `NTH_RATIO=100000000` in both the dApp metadata and the generated
CLI registration command. `NTH_RATIO` is a ratio, **not** a decimal-place count;
setting it to `8` would not mean eight decimal places.

The core treats this metadata field as opaque. It does not change consensus
amounts, minting limits or transaction arithmetic. Other frontends may interpret
metadata differently; this app does not use it to rescale amounts. Existing
assets and their metadata are not rewritten, and no balance migration is needed.
The details view labels historical ratios as metadata only and shows the fixed
eight-decimal precision separately. Metadata values cannot contain `;`, the field
separator, so optional descriptions cannot inject a second ratio field.

This addresses the creation-form clarification in
[Beam #2173](https://github.com/BeamMW/beam/issues/2173) and
[Asset Minter #15](https://github.com/BeamMW/asset-minter-app/issues/15), not the
precision/hard-fork proposal in Beam #2172.

### Precision regression checks

After installing dependencies, run `node --test tests/asset-precision.test.cjs`
with Node.js 18 or later. The checks execute the creation page with mocked
React/Formik and wallet boundaries: no asset is registered. They cover the
locked precision control, identical fixed-ratio metadata for wallet submission
and the copied CLI command, and required-field validation. They do not replace
browser or wallet integration testing.

For browser coverage, build with `npm run build` and serve `html/` locally:
`python3 -m http.server 18373 --bind 127.0.0.1 --directory html`.
With Playwright available on `NODE_PATH`, run
`node tests/browser-asset-precision.cjs`. Optionally set `CHROMIUM_PATH` to an
installed Chromium executable and `BROWSER_ARTIFACT_DIR` for screenshots.
This optional test does not add a production dependency. It exercises the built
UI and wallet request boundary with a synthetic wallet, blocks external HTTP,
and checks old ratios (including zero and omission), fixed new metadata,
separator rejection and unchanged supply conversion. It does not sign or
broadcast transactions and does not verify a real wallet/node integration.
