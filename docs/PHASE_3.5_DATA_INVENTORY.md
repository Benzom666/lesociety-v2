# MONGODB DUMP INVENTORY & CLASSIFICATION

## Dump Location
`/run/media/benzom/1A2C58B02C5888A1/PROJECTS/LS9/lesociety/lesociety/`

## File Classification

### ✅ REFERENCE DATA (Safe to Import)
| File | Size | Purpose | Target Supabase Table |
|------|------|---------|----------------------|
| `aspirations.bson` | 22K | User aspirations/interests (lookup) | *Skip - Not in schema* |
| `aspirations_bk.bson` | 20K | Backup of aspirations | *Skip* |
| `categories.bson` | 889B | Date categories | *Skip - Hardcoded in frontend* |
| `categories_bk.bson` | 772B | Backup | *Skip* |
| `countries.bson` | 65B | Country list | *Skip - Hardcoded in Utilities.js* |
| `defaultmessages.bson` | 1.3K | Default chat messages | *Skip - Not needed* |

### ❌ USER-RELATED DATA (DO NOT IMPORT per rules)
| File | Size | Reason |
|------|------|--------|
| `users.bson` | 104K | **SKIP** - User auth/profiles (create fresh via Supabase Auth) |
| `chatrooms.bson` | 16K | **SKIP** - User chats |
| `chats.bson` | 27K | **SKIP** - Chat messages |
| `notifications.bson` | 17K | **SKIP** - User notifications |
| `dates.bson` | 35K | **SKIP** - User-created date posts (legacy data) |

### ⚠️ EMPTY/LEGACY (Ignore)
| File | Size | Reason |
|------|------|--------|
| `influencers.bson` | 0B | Empty |
| `promotions.bson` | 0B | Empty |

---

## DECISION: NO IMPORT NEEDED

### Rationale
1. **Categories:** Already hardcoded in `apps/web/utils/Utilities.js` as `dateCategory` array (9 categories with icons)
2. **Countries:** Already hardcoded in `apps/web/utils/Utilities.js` as `countriesCode` object (200+ countries)
3. **Aspirations:** Not part of current Supabase schema (profiles table doesn't have aspirations field)
4. **Default Messages:** Feature may not be needed in v2
5. **User Data:** Explicitly forbidden to restore per Phase 3.5 rules

### Verification
```javascript
// From apps/web/utils/Utilities.js (lines 165-244)
export const dateCategory = [
  { label: "Morning Date", id: "MorningBeverage", ... },
  { label: "Outdoor Adventure", id: "OutdoorAdventure", ... },
  { label: "Evening Date", id: "EveningDate", ... },
  // ... 9 categories total
];

// From apps/web/utils/Utilities.js (lines 246-501)
export const countriesCode = {
  Andorra: "AD",
  "United Arab Emirates (the)": "AE",
  // ... 200+ countries
};
```

---

## RECOMMENDATION

**No data import required for Phase 3.5.**

All reference data (categories, countries) is already embedded in the frontend codebase and matches the v1 structure exactly.

If user wants to:
- **Add aspirations feature:** First add `aspirations` JSONB column to `profiles` table, then write import script
- **Import legacy date posts for testing:** Can import `dates.bson` but must:
  1. Create fake users in Supabase first
  2. Remap MongoDB ObjectIds → Supabase UUIDs
  3. Mark all as `status='pending'` for admin review

---

## FILES TO EXAMINE (Optional)

If user wants to inspect dump contents:

```bash
# Install bsondump
sudo apt install mongo-tools

# Convert BSON to JSON
cd /run/media/benzom/1A2C58B02C5888A1/PROJECTS/LS9/lesociety/lesociety
bsondump categories.bson > categories.json
bsondump countries.bson > countries.json
```

---

## PHASE 3.5 STATUS

✅ **Inventory Complete**  
✅ **Classification Complete**  
✅ **Decision: No Import Needed** (Reference data already in codebase)

**Next:** User confirms whether to proceed to Phase 4 or if they want specific legacy data imported despite recommendations.

