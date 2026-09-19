# Codex Gate Verification Mode

Run gates and report exact results.

## Common Salryn gates

```powershell
git diff --check
dotnet build Salryn.sln
dotnet run --project tools\Salryn.Tools.CoreSmoke
```

## Focused CoreSmoke examples

```powershell
dotnet run --project tools\Salryn.Tools.CoreSmoke -- --only pos-m1-receipt-snapshot-file-receipt
dotnet run --project tools\Salryn.Tools.CoreSmoke -- --only pos-m2-printer-reprint-failure
dotnet run --project tools\Salryn.Tools.CoreSmoke -- --only pos-m3-barcode-scanner-cashier-flow
dotnet run --project tools\Salryn.Tools.CoreSmoke -- --only pos-m4-fast-add-unknown-barcode-inventory
dotnet run --project tools\Salryn.Tools.CoreSmoke -- --only pos-m5-product-write-management
dotnet run --project tools\Salryn.Tools.CoreSmoke -- --only pos-m6-stock-in-stock-adjustment
```

## Frontend changed

```powershell
npm --prefix <web-path> run build
```

## Rule

Do not claim green if a gate was skipped.
