
```
ALL_INDIA_VILLAGES_API
├─ backend
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ prisma
│  │  ├─ migrations
│  │  │  ├─ 20260409094212_init
│  │  │  │  └─ migration.sql
│  │  │  ├─ 20260409094546_add_trigram_extension
│  │  │  │  └─ migration.sql
│  │  │  ├─ 20260409095902_init_schema
│  │  │  │  └─ migration.sql
│  │  │  └─ migration_lock.toml
│  │  ├─ schema.prisma
│  │  └─ seed.ts
│  ├─ src
│  │  ├─ app.ts
│  │  ├─ config
│  │  │  ├─ db.ts
│  │  │  ├─ env.ts
│  │  │  └─ redis.ts
│  │  ├─ constants
│  │  ├─ controllers
│  │  │  ├─ admin.controller.ts
│  │  │  ├─ auth.controller.ts
│  │  │  ├─ b2b.controller.ts
│  │  │  └─ geo.controller.ts
│  │  ├─ jobs
│  │  │  ├─ usageAggregation.job.ts
│  │  │  └─ usageScheduler.ts
│  │  ├─ middlewares
│  │  │  ├─ apiKeyAuth.middleware.ts
│  │  │  ├─ errorHandler.middleware.ts
│  │  │  ├─ jwtAuth.middleware.ts
│  │  │  ├─ logger.middleware.ts
│  │  │  └─ rateLimit.middleware.ts
│  │  ├─ repositories
│  │  ├─ routes
│  │  │  ├─ admin.routes.ts
│  │  │  ├─ auth.routes.ts
│  │  │  ├─ b2b.routes.ts
│  │  │  └─ geo.routes.ts
│  │  ├─ scripts
│  │  │  └─ createTestUser.ts
│  │  ├─ server.ts
│  │  ├─ services
│  │  │  ├─ admin.service.ts
│  │  │  ├─ auth.service.ts
│  │  │  ├─ b2b.service.ts
│  │  │  └─ geo.service.ts
│  │  ├─ test-env.ts
│  │  ├─ testApp.ts
│  │  ├─ utils
│  │  │  ├─ cache.ts
│  │  │  └─ redisLock.ts
│  │  └─ validations
│  ├─ tests
│  │  ├─ auth-admin-b2b-geo.test.ts
│  │  ├─ helpers.ts
│  │  └─ vitest.setup.ts
│  ├─ tsconfig.json
│  └─ vitest.config.ts
├─ data-import
│  ├─ cleaned
│  ├─ raw
│  │  ├─ Rdir_2011_02_HIMACHAL_PRADESH.xls
│  │  ├─ Rdir_2011_03_PUNJAB.xls
│  │  ├─ Rdir_2011_06_HARYANA.xls
│  │  ├─ Rdir_2011_08_RAJASTHAN.xls
│  │  ├─ Rdir_2011_09_UTTAR_PRADESH.ods
│  │  ├─ Rdir_2011_09_UTTAR_PRADESH.xls
│  │  ├─ Rdir_2011_10_BIHAR.xls
│  │  ├─ Rdir_2011_11_SIKKIM.xls
│  │  ├─ Rdir_2011_12_ARUNACHAL_PRADESH.xls
│  │  ├─ Rdir_2011_13_NAGALAND.xls
│  │  ├─ Rdir_2011_15_MIZORAM.xls
│  │  ├─ Rdir_2011_16_TRIPURA.xls
│  │  ├─ Rdir_2011_17_MEGHALAYA.xls
│  │  ├─ Rdir_2011_18_ASSAM.xls
│  │  ├─ Rdir_2011_19_WEST_BENGAL.xls
│  │  ├─ Rdir_2011_20_JHARKHAND.xls
│  │  ├─ Rdir_2011_21_ODISHA.xls
│  │  ├─ Rdir_2011_22_CHHATTISGARH.xls
│  │  ├─ Rdir_2011_23_MADHYA_PRADESH.xls
│  │  ├─ Rdir_2011_24_GUJARAT.xls
│  │  ├─ Rdir_2011_25_DAMAN_and_DIU.xls
│  │  ├─ Rdir_2011_26_DADRA_and_NAGAR_HAVELI.xls
│  │  ├─ Rdir_2011_27_MAHARASHTRA.xls
│  │  ├─ Rdir_2011_28_ANDHRA_PRADESH.xls
│  │  ├─ Rdir_2011_29_KARNATAKA.xls
│  │  ├─ Rdir_2011_30_GOA.xls
│  │  ├─ Rdir_2011_31_LAKSHADWEEP.xls
│  │  ├─ Rdir_2011_32_KERALA.xls
│  │  ├─ Rdir_2011_33_TAMIL_NADU.xls
│  │  ├─ Rdir_2011_34_PUDUCHERRY.xls
│  │  └─ Rdir_2011_35_ANDAMAN_and_NICOBAR_ISLANDS.xls
│  ├─ reports
│  │  ├─ audit_report.json
│  │  └─ import_summary.json
│  ├─ requirements.txt
│  └─ scripts
│     ├─ audit_cleaned_data.py
│     ├─ clean_all_states.py
│     ├─ config.py
│     ├─ diagnose_import.py
│     ├─ import.py
│     ├─ import_to_db.py
│     ├─ inspect_cleaned.py
│     ├─ inspect_mp.py
│     └─ utils.py
├─ demo-client
│  ├─ eslint.config.js
│  ├─ index.html
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ public
│  │  ├─ favicon.svg
│  │  └─ icons.svg
│  ├─ README.md
│  ├─ src
│  │  ├─ App.css
│  │  ├─ App.tsx
│  │  ├─ assets
│  │  │  ├─ hero.png
│  │  │  ├─ react.svg
│  │  │  └─ vite.svg
│  │  ├─ index.css
│  │  └─ main.tsx
│  ├─ tsconfig.app.json
│  ├─ tsconfig.json
│  ├─ tsconfig.node.json
│  └─ vite.config.ts
├─ docs
│  └─ TDD.md
├─ frontend
│  ├─ eslint.config.js
│  ├─ index.html
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ public
│  │  ├─ favicon.svg
│  │  └─ icons.svg
│  ├─ README.md
│  ├─ src
│  │  ├─ api
│  │  ├─ App.css
│  │  ├─ App.tsx
│  │  ├─ assets
│  │  │  ├─ hero.png
│  │  │  ├─ react.svg
│  │  │  └─ vite.svg
│  │  ├─ components
│  │  │  ├─ Badge.tsx
│  │  │  ├─ Card.tsx
│  │  │  ├─ ConfirmDialog.tsx
│  │  │  ├─ Layout.tsx
│  │  │  ├─ Pagination.tsx
│  │  │  └─ StatCard.tsx
│  │  ├─ config
│  │  │  └─ api.ts
│  │  ├─ hooks
│  │  ├─ index.css
│  │  ├─ index.html
│  │  ├─ layouts
│  │  ├─ lib
│  │  │  └─ api.ts
│  │  ├─ main.tsx
│  │  ├─ pages
│  │  │  ├─ admin
│  │  │  │  ├─ Dashboard.tsx
│  │  │  │  ├─ Logs.tsx
│  │  │  │  ├─ Overview.tsx
│  │  │  │  ├─ UserDetail.tsx
│  │  │  │  └─ Users.tsx
│  │  │  ├─ auth
│  │  │  │  ├─ Login.tsx
│  │  │  │  └─ Register.tsx
│  │  │  ├─ b2b
│  │  │  │  ├─ ApiKeys.tsx
│  │  │  │  ├─ Dashboard.tsx
│  │  │  │  ├─ Overview.tsx
│  │  │  │  ├─ Profile.tsx
│  │  │  │  └─ Usage.tsx
│  │  │  └─ public
│  │  ├─ routes
│  │  ├─ store
│  │  │  └─ authStore.ts
│  │  ├─ types
│  │  └─ utils
│  │     └─ format.ts
│  ├─ tailwind.config.js
│  ├─ tsconfig.app.json
│  ├─ tsconfig.json
│  ├─ tsconfig.node.json
│  └─ vite.config.ts
└─ README.md

```