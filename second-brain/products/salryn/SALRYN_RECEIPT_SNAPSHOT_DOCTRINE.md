# Receipt Snapshot Doctrine

Receipt snapshots are immutable.

Reprint must use the saved snapshot, not current mutable catalog or store data.

## Forbidden

- recalculating old receipt totals from current product data
- rewriting original receipt snapshots during reprint
- creating duplicate sale/payment records from print or reprint
- treating receipt formatting as a mutation path

## Required proof for receipt lanes

- original sale remains unchanged
- reprint does not create sale/payment/stock movement
- snapshot content remains stable
- visual receipt checks are manual unless actually inspected
