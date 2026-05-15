import urllib.request
import re

urls = {
    "Healthcare": "4386466",
    "Dental Clinic": "3845626",
    "Pharmacy": "3683042",
    "Veterinary": "6231768",
    "Restaurant": "260922",
    "Bakery": "5710149",
    "Coffee Shop": "312418",
    "Real Estate": "106399",
    "Interior Design": "1571460",
    "Architecture": "1732414",
    "Fitness Gym": "1954524",
    "Yoga Studio": "3823039",
    "Spa": "210019",
    "Education": "5212345",
    "University": "267885",
    "E-Commerce": "5632379",
    "Fashion": "298863",
    "Finance": "4386363",
    "Accounting": "6863170",
    "Hair Salon": "3993449",
    "Nail Studio": "3993454",
    "Barbershop": "247322",
    "Skincare": "4041392",
    "Travel": "3278215",
    "Hotel": "258154",
    "Resort": "338504",
    "Events": "587741",
    "Weddings": "1024993",
    "Music": "1763075",
    "Tech Startup": "3184418",
    "Gaming": "316444",
    "Automotive": "120049",
    "Construction": "209251",
    "Agriculture": "1904716",
    "Floristry": "126859",
    "Photography": "1181467",
    "Sports": "248547"
}

req = urllib.request.Request(
    'https://www.pexels.com/photo/316444/', 
    headers={'User-Agent': 'Mozilla/5.0'}
)
try:
    with urllib.request.urlopen(req) as response:
        html = response.read().decode('utf-8')
        match = re.search(r'<title>(.*?)</title>', html)
        if match:
            print("Gaming 316444:", match.group(1))
except Exception as e:
    print(e)
