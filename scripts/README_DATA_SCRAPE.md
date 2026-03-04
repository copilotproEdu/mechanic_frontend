# Data Scrape Script

Run this script to generate searchable frontend datasets for:
- car makes, models, and year options
- common auto parts

## Command

```bash
npm run scrape:data
```

## Output files

- `public/data/makes_models.json`
- `public/data/parts.json`

## Notes

- Makes and models are fetched from the public NHTSA vPIC API.
- Year options are generated as a range from 2005 to the current year.
- Parts are generated from a curated common automotive parts list.
- If external API calls fail, a fallback list is used so output files are still generated.
