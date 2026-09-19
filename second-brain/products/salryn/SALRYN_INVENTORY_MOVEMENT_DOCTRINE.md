# Inventory Movement Doctrine

Stock changes must go through inventory movement paths.

Product edit must not casually change stock quantity.

## Allowed stock paths

- checkout after committed sale
- stock-in
- stock-adjustment
- approved void reversal

## Forbidden

- hidden stock mutation on product edit
- changing quantity without movement evidence
- reprint affecting stock
- failed checkout affecting stock
- repair code silently modifying stock

## Required proof

Every stock mutation must leave evidence and be reproducible through an automated gate where possible.
