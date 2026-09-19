# Case Study — Tapost: Evidence-Gated Native Acceptance

## Source anchors

Repository:

`Kirch-Nairu/Tapost.AI-ATTEMPT`

Inspected branch:

`KIRCH-TAPOST-NATIVE-ANDROID-V1`

Observed branch head:

`3723c26b7eaa0609fdff722e30140df4b763bc5e`

Observed head commit message:

`fix: align React types with Expo SDK 57`

Primary acceptance artifact:

`docs/ANDROID_N1_ACCEPTANCE.md`

Observed blob SHA:

`f9dbfef97d269cf592c40a0702e26f451751554c`

---

## What the repository shows

### 1. Architecture can be implemented without overclaiming operational proof

The N1 acceptance document records a concrete native architecture:

```text
React Native UI
      |
      v
SessionController
   |          |
   |          +--> AlarmEngine --> AndroidAlarmEngine --> TapostAlarm Expo local module
   |                                                   |
   |                                                   +--> AlarmManager
   |                                                   +--> BroadcastReceiver
   |                                                   +--> SharedPreferences alarm metadata
   |                                                   +--> high-importance alarm notification
   |                                                   +--> BOOT_COMPLETED recovery
   |
   +--> TaskRepository --> NativeTaskRepository --> SQLite
```

The document distinguishes the visible JavaScript countdown from Android-native scheduling. It records `target_end` in persistence while scheduling the deadline independently through Android `AlarmManager`.

That is source-level architectural evidence.

It is not yet proof that every lifecycle scenario succeeds on a physical Android device.

### Forge lesson

Forge must separate:

- implemented architecture;
- static source inspection;
- automated compile/test evidence;
- emulator evidence;
- physical-device evidence;
- deployed/operational evidence.

These are not interchangeable.

---

## 2. The acceptance document explicitly holds claims back

The source document contains a 12-scenario device acceptance matrix covering:

- foreground behavior;
- background behavior;
- screen lock;
- process removal/killing;
- notification permission states;
- snooze;
- completion before alarm;
- cancellation before alarm;
- reboot restoration;
- exact-alarm access denied;
- exact-alarm access granted.

Every observed row was still marked `NOT RUN` in the inspected artifact.

The document explicitly says not to replace `NOT RUN` with `PASS` without concrete device or emulator evidence and that a physical-device claim requires a physical device.

### Forge lesson

A good engineering artifact can be valuable precisely because it refuses to say "PASS."

Unverified evidence should remain visibly unverified.

Forge therefore treats:

- `implemented`;
- `builds`;
- `automated tests pass`;
- `works on emulator`;
- `works on physical device`;

as separate claims requiring separate evidence.

---

## 3. Process death and force-stop were explicitly separated

The acceptance document records reboot recovery implementation through `TapostBootReceiver`, but keeps it **UNVERIFIED ON DEVICE** until its corresponding acceptance scenario passes.

It also states that Android process removal/killing is not equivalent to a user force-stopping the application in Android Settings and makes no force-stop guarantee.

### Forge lesson

Precise language is part of engineering evidence.

If two operating-system states have different semantics, Forge should not compress them into a vague statement such as "survives app kill."

This protects future Maintainers from inheriting an exaggerated claim.

---

## 4. Permission-state behavior was part of the claim boundary

The source describes exact-alarm access and notification permission behavior explicitly.

When exact scheduling is not available, the implementation uses an inexact fallback and the UI is expected to represent that state honestly.

When notification permission is denied, the native scheduling path may execute, but the document refuses to claim audible/user-visible delivery because the operating system suppresses notification presentation.

### Forge lesson

A feature claim must include its environmental preconditions.

"Alarm works" is too broad if OS permissions materially alter what the user experiences.

Acceptance should therefore record:

- state;
- permissions;
- platform version;
- device/runtime;
- expected behavior;
- observed behavior.

---

## 5. Automated evidence was explicitly narrower than device acceptance

The source describes automated session/controller coverage for invariants such as:

- one active session;
- reserved duration preservation after a late start;
- real `actual_end` capture;
- snooze semantics;
- native-alarm cancellation abstraction;
- relaunch recovery of missing native schedules.

It also states that GitHub Actions is the compile authority for the branch because the implementation environment lacked direct outbound package/repository access. The CI path was intended to run domain tests, TypeScript validation, Expo Doctor, clean Android prebuild, and `./gradlew assembleDebug`.

Even with that automated evidence, the source separately holds back device-specific claims.

### Forge lesson

CI can be authoritative for the thing CI actually observed.

CI cannot automatically become authority for behavior outside its execution environment.

This is a direct example of Forge's evidence ladder:

- source implementation can reach source-inspection evidence;
- CI can establish automated-validation evidence;
- physical-device lifecycle claims require runtime/device evidence.

---

## 6. The architecture uses explicit boundaries to preserve replaceability

The alarm behavior sits behind an `AlarmEngine` abstraction instead of leaking native scheduling directly into presentation state.

Likewise, task persistence is abstracted behind `TaskRepository` with a native implementation using SQLite.

### Forge lesson

Agent speed improves when the architecture already contains clean replacement boundaries.

The writer can implement a new runtime adapter while preserving domain contracts, and the Maintainer can evaluate whether the adapter satisfies the boundary without re-litigating the whole application.

---

## Case-study conclusion

Tapost demonstrates the difference between **having code for a behavior** and **possessing evidence that the behavior survives the environment where the claim matters**.

Forge should preserve that distinction everywhere:

1. source existence is not runtime proof;
2. automated build success is not device acceptance;
3. process death is not force-stop;
4. permission-dependent behavior must state its preconditions;
5. unrun acceptance scenarios remain unrun;
6. unsupported claims are explicitly held back rather than rounded up to "done."

The result is slower language but stronger engineering truth.

## Traceable evidence

- `https://github.com/Kirch-Nairu/Tapost.AI-ATTEMPT/tree/KIRCH-TAPOST-NATIVE-ANDROID-V1`
- `https://github.com/Kirch-Nairu/Tapost.AI-ATTEMPT/blob/KIRCH-TAPOST-NATIVE-ANDROID-V1/docs/ANDROID_N1_ACCEPTANCE.md`
- `https://github.com/Kirch-Nairu/Tapost.AI-ATTEMPT/commit/3723c26b7eaa0609fdff722e30140df4b763bc5e`
