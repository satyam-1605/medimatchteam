

## Plan: Add Manual Location Search to Find Doctors Page

### Summary
Add a location search input in the location bar that lets users type any city/place name (e.g., "Mumbai") to find doctors in that area. Uses OpenStreetMap Nominatim for geocoding. Also fixes the outstanding issues: distance units still show miles instead of km.

### Changes to `src/pages/DoctorDirectory.tsx`

**1. Add manual location search state**
- New state: `manualLocationQuery` (string), `locationSuggestions` (array of geocoded results), `isSearchingLocation` (boolean)

**2. Add geocoding function**
- Create `searchLocation(query)` that calls Nominatim forward geocoding API (`https://nominatim.openstreetmap.org/search?q=...&format=json&limit=5`)
- Debounce the search (300ms) as user types
- Returns list of place suggestions with display name, lat, lng

**3. Update the Location Bar UI**
- Add a search input next to the "Detect" button with a `MapPin` icon and placeholder "Search a city or place..."
- Show a dropdown of location suggestions below the input when results are available
- When user selects a suggestion, update `userLocation` coordinates and `locationName` to the selected place
- Add a visual indicator showing whether location is GPS-detected or manually set

**4. Fix miles → kilometers**
- Change Haversine `R = 3958.8` to `R = 6371`
- Update distance radius options from `[2, 5, 10, 25, 50]` to `[5, 10, 25, 50, 100]`
- Update default `maxDistance` from `10` to `25`
- Replace all `mi` labels with `km`
- Update distance display in `doctorsWithDistance` from `mi` to `km`

### Files to Edit
- **`src/pages/DoctorDirectory.tsx`** — All changes in this single file

