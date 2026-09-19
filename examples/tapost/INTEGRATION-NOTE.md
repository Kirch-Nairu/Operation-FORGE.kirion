# Tapost Integration Interpretation

This note aligns the existing Tapost case study with the operationally hardened Forge evidence model without upgrading any device claim.

## SOURCE FACT

The cited Tapost branch `KIRCH-TAPOST-NATIVE-ANDROID-V1` was re-checked during this integration and remained at:

`3723c26b7eaa0609fdff722e30140df4b763bc5e`

At that exact state, `docs/ANDROID_N1_ACCEPTANCE.md` still records every device acceptance scenario A1 through A12 as `NOT RUN`. It explicitly keeps reboot recovery unverified on device, separates process removal from force-stop, and makes no full-screen, force-stop, iOS, or denied-notification audible-delivery guarantee.

GitHub Actions run `34016392071` also targets this exact SHA and completed successfully. Its observed jobs include successful native domain tests, native TypeScript validation, Expo project validation, Android prebuild, debug APK assembly, web type checking, and web production build.

## FORGE INTERPRETATION

The successful CI execution is **E4 — Automated validation** for the commands and environments that the workflow actually exercised. Its evidence types include test/static/build evidence and its provenance is automated.

That E4 evidence does not transfer into **E5 — Runtime acceptance** for the A1–A12 device lifecycle scenarios. The canonical [Evidence Model](../../doctrine/evidence-model.md) and [Evidence Manifest](../../testing/evidence-manifest.md) require the claim, evidence level, type, provenance, candidate SHA, environment, result, and limitations to remain distinct.

The original `NOT RUN` device rows therefore remain correct even though build/test automation is green.

## LESSON

Implementation existence, successful CI, emulator/device behavior, deployment, and operational use are different claims. A stronger evidence level for one claim does not automatically strengthen neighboring claims.

## LIMITATION / UNVERIFIED AREA

No A1–A12 device scenario is upgraded by this integration. Process-death delivery, reboot recovery on a device, OEM/Doze exact timing, force-stop behavior, full-screen takeover, denied-notification audible delivery, and iOS support remain outside the verified device claim boundary unless separately evidenced.