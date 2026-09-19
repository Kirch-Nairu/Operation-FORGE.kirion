# Salryn Gate Matrix

Gates define proof. They are not optional unless marked N/A with a reason.

## Common gates

```powershell
git status
git diff --check
dotnet build Salryn.sln
dotnet run --project tools\Salryn.Tools.CoreSmoke
```

## Frontend changed

```powershell
npm --prefix <web-path> run build
```

## Focused POS targets

```powershell
dotnet run --project tools\Salryn.Tools.CoreSmoke -- --only pos-m1-receipt-snapshot-file-receipt
dotnet run --project tools\Salryn.Tools.CoreSmoke -- --only pos-m2-printer-reprint-failure
dotnet run --project tools\Salryn.Tools.CoreSmoke -- --only pos-m3-barcode-scanner-cashier-flow
dotnet run --project tools\Salryn.Tools.CoreSmoke -- --only pos-m4-fast-add-unknown-barcode-inventory
dotnet run --project tools\Salryn.Tools.CoreSmoke -- --only pos-m5-product-write-management
dotnet run --project tools\Salryn.Tools.CoreSmoke -- --only pos-m6-stock-in-stock-adjustment
```

## Status words

Use only:

- PASSED
- FAILED
- NOT RUN
- BLOCKED
- N/A

Do not write "green" if anything required was skipped.
