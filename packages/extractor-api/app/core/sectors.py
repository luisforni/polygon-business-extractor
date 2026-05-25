"""Unified sector taxonomy and per-provider category mappings."""

SECTORS = [
    "food_drink",
    "retail",
    "health",
    "education",
    "finance",
    "transport",
    "accommodation",
    "entertainment",
    "services",
    "other",
]

# OSM key → values mapping per sector
SECTOR_OSM_TAGS: dict[str, dict[str, list[str] | str]] = {
    "food_drink": {
        "amenity": ["restaurant", "cafe", "bar", "fast_food", "pub", "food_court", "ice_cream"],
    },
    "retail": {
        "shop": "*",
    },
    "health": {
        "amenity": ["pharmacy", "hospital", "clinic", "doctors", "dentist", "veterinary"],
        "healthcare": "*",
    },
    "education": {
        "amenity": ["school", "university", "college", "kindergarten", "library"],
    },
    "finance": {
        "amenity": ["bank", "atm", "bureau_de_change"],
    },
    "transport": {
        "amenity": ["fuel", "parking", "car_rental", "taxi", "bicycle_rental"],
    },
    "accommodation": {
        "tourism": ["hotel", "hostel", "motel", "guest_house", "apartment"],
    },
    "entertainment": {
        "amenity": ["cinema", "theatre", "nightclub", "casino", "arts_centre"],
        "leisure": ["sports_centre", "fitness_centre", "stadium", "park"],
    },
    "services": {
        "amenity": ["post_office", "police", "fire_station", "courthouse", "embassy"],
        "office": "*",
    },
}

# Google Places types per sector
SECTOR_GOOGLE_TYPES: dict[str, list[str]] = {
    "food_drink": ["restaurant", "cafe", "bar", "bakery", "meal_delivery", "meal_takeaway"],
    "retail": ["store", "clothing_store", "electronics_store", "furniture_store", "supermarket",
               "shopping_mall", "convenience_store", "book_store", "jewelry_store"],
    "health": ["pharmacy", "hospital", "doctor", "dentist", "health", "veterinary_care"],
    "education": ["school", "university", "library"],
    "finance": ["bank", "atm", "finance"],
    "transport": ["gas_station", "parking", "car_rental", "car_dealer"],
    "accommodation": ["lodging"],
    "entertainment": ["movie_theater", "night_club", "casino", "gym", "stadium", "amusement_park"],
    "services": ["post_office", "police", "local_government_office", "lawyer", "insurance_agency"],
}

# Foursquare category IDs per sector (top-level IDs)
SECTOR_FOURSQUARE_IDS: dict[str, list[str]] = {
    "food_drink": ["13000"],        # Food & Drink
    "retail": ["17000"],            # Retail
    "health": ["15000"],            # Health & Medicine
    "education": ["12000"],         # Education
    "finance": ["11000"],           # Finance
    "transport": ["19000"],         # Transportation
    "accommodation": ["19014"],     # Lodging
    "entertainment": ["10000"],     # Arts & Entertainment
    "services": ["18000"],          # Professional & Other Places
}

# Yelp category aliases per sector
SECTOR_YELP_ALIASES: dict[str, list[str]] = {
    "food_drink": ["restaurants", "food", "bars", "cafes", "bakeries"],
    "retail": ["shopping", "fashion", "electronics", "bookstores", "grocery"],
    "health": ["health", "pharmacy", "hospitals", "dentists", "doctors"],
    "education": ["educationservices", "libraries"],
    "finance": ["banks", "financialadvising"],
    "transport": ["servicestations", "parking", "carrental"],
    "accommodation": ["hotels", "hostels"],
    "entertainment": ["movietheaters", "nightlife", "casinos", "gyms", "sportsentertainment"],
    "services": ["professional", "localservices", "publicservicesgovt"],
}
