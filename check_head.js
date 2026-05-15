const https = require('https');

const urls = [
    { label: "Healthcare", url: "https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?w=300&h=200&fit=crop" },
    { label: "Dental Clinic", url: "https://images.pexels.com/photos/3845626/pexels-photo-3845626.jpeg?w=300&h=200&fit=crop" },
    { label: "Pharmacy", url: "https://images.pexels.com/photos/3683042/pexels-photo-3683042.jpeg?w=300&h=200&fit=crop" },
    { label: "Veterinary", url: "https://images.pexels.com/photos/6231768/pexels-photo-6231768.jpeg?w=300&h=200&fit=crop" },
    { label: "Restaurant", url: "https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg?w=300&h=200&fit=crop" },
    { label: "Bakery", url: "https://images.pexels.com/photos/5710149/pexels-photo-5710149.jpeg?w=300&h=200&fit=crop" },
    { label: "Coffee Shop", url: "https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?w=300&h=200&fit=crop" },
    { label: "Real Estate", url: "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?w=300&h=200&fit=crop" },
    { label: "Interior Design", url: "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?w=300&h=200&fit=crop" },
    { label: "Architecture", url: "https://images.pexels.com/photos/1732414/pexels-photo-1732414.jpeg?w=300&h=200&fit=crop" },
    { label: "Fitness Gym", url: "https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?w=300&h=200&fit=crop" },
    { label: "Yoga Studio", url: "https://images.pexels.com/photos/3823039/pexels-photo-3823039.jpeg?w=300&h=200&fit=crop" },
    { label: "Spa", url: "https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg?w=300&h=200&fit=crop" },
    { label: "Education", url: "https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?w=300&h=200&fit=crop" },
    { label: "University", url: "https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?w=300&h=200&fit=crop" },
    { label: "E-Commerce", url: "https://images.pexels.com/photos/5632379/pexels-photo-5632379.jpeg?w=300&h=200&fit=crop" },
    { label: "Fashion", url: "https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?w=300&h=200&fit=crop" },
    { label: "Finance", url: "https://images.pexels.com/photos/4386363/pexels-photo-4386363.jpeg?w=300&h=200&fit=crop" },
    { label: "Accounting", url: "https://images.pexels.com/photos/6863170/pexels-photo-6863170.jpeg?w=300&h=200&fit=crop" },
    { label: "Hair Salon", url: "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?w=300&h=200&fit=crop" },
    { label: "Nail Studio", url: "https://images.pexels.com/photos/3993454/pexels-photo-3993454.jpeg?w=300&h=200&fit=crop" },
    { label: "Barbershop", url: "https://images.pexels.com/photos/247322/pexels-photo-247322.jpeg?w=300&h=200&fit=crop" },
    { label: "Skincare", url: "https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?w=300&h=200&fit=crop" },
    { label: "Travel", url: "https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg?w=300&h=200&fit=crop" },
    { label: "Hotel", url: "https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?w=300&h=200&fit=crop" },
    { label: "Resort", url: "https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?w=300&h=200&fit=crop" },
    { label: "Events", url: "https://images.pexels.com/photos/587741/pexels-photo-587741.jpeg?w=300&h=200&fit=crop" },
    { label: "Weddings", url: "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?w=300&h=200&fit=crop" },
    { label: "Music", url: "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?w=300&h=200&fit=crop" },
    { label: "Tech Startup", url: "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?w=300&h=200&fit=crop" },
    { label: "Gaming", url: "https://images.pexels.com/photos/316444/pexels-photo-316444.jpeg?w=300&h=200&fit=crop" },
    { label: "Automotive", url: "https://images.pexels.com/photos/120049/pexels-photo-120049.jpeg?w=300&h=200&fit=crop" },
    { label: "Construction", url: "https://images.pexels.com/photos/209251/pexels-photo-209251.jpeg?w=300&h=200&fit=crop" },
    { label: "Agriculture", url: "https://images.pexels.com/photos/1904716/pexels-photo-1904716.jpeg?w=300&h=200&fit=crop" },
    { label: "Floristry", url: "https://images.pexels.com/photos/126859/pexels-photo-126859.jpeg?w=300&h=200&fit=crop" },
    { label: "Photography", url: "https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?w=300&h=200&fit=crop" },
    { label: "Sports", url: "https://images.pexels.com/photos/248547/pexels-photo-248547.jpeg?w=300&h=200&fit=crop" }
];

async function checkAll() {
    for (let item of urls) {
        await new Promise(resolve => {
            const req = https.request(item.url, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
                if (res.statusCode !== 200) {
                    console.log(item.label.padEnd(20), res.statusCode);
                }
                resolve();
            });
            req.on('error', () => {
                console.log(item.label.padEnd(20), 'ERROR');
                resolve();
            });
            req.end();
        });
    }
}
checkAll();
