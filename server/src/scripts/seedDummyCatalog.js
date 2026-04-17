import "dotenv/config";
import connection from "../configs/db.js";
import "../models/index.js";
import brandModel from "../models/brandModel.js";
import productModel from "../models/productModel.js";
import userModel from "../models/userModel.js";
import doctorProfileModel from "../models/doctorProfileModel.js";
import treatmentModel from "../models/treatmentModel.js";

const clientBaseUrl = process.env.CLIENT_URL || "http://localhost:3000";

const realBrands = [
  {
    name: "CeraVe",
    description:
      "Dermatologist-developed skincare focused on restoring the skin barrier.",
    website_url: "https://www.cerave.com",
    logo_url: "https://logo.clearbit.com/cerave.com",
    is_active: true,
  },
  {
    name: "La Roche-Posay",
    description:
      "French skincare brand known for sensitive-skin friendly dermatological formulas.",
    website_url: "https://www.laroche-posay.us",
    logo_url: "https://logo.clearbit.com/laroche-posay.us",
    is_active: true,
  },
  {
    name: "Neutrogena",
    description:
      "Accessible skincare and sun care products with broad dermatology adoption.",
    website_url: "https://www.neutrogena.com",
    logo_url: "https://logo.clearbit.com/neutrogena.com",
    is_active: true,
  },
  {
    name: "Cetaphil",
    description:
      "Gentle daily skincare solutions designed for sensitive and dry skin.",
    website_url: "https://www.cetaphil.com",
    logo_url: "https://logo.clearbit.com/cetaphil.com",
    is_active: true,
  },
  {
    name: "The Ordinary",
    description:
      "Ingredient-forward skincare with targeted serums and treatment products.",
    website_url: "https://theordinary.com",
    logo_url: "https://logo.clearbit.com/theordinary.com",
    is_active: true,
  },
  {
    name: "Paula's Choice",
    description:
      "Research-led skincare with science-backed exfoliants and treatment lines.",
    website_url: "https://www.paulaschoice.com",
    logo_url: "https://logo.clearbit.com/paulaschoice.com",
    is_active: true,
  },
  {
    name: "Bioderma",
    description:
      "French dermatological skincare with strong focus on sensitivity and skin tolerance.",
    website_url: "https://www.bioderma.us",
    logo_url: "https://logo.clearbit.com/bioderma.us",
    is_active: true,
  },
  {
    name: "Eucerin",
    description:
      "Clinical skincare brand known for dry skin and barrier-focused formulations.",
    website_url: "https://www.eucerinus.com",
    logo_url: "https://logo.clearbit.com/eucerinus.com",
    is_active: true,
  },
];

const realProducts = [
  {
    brandName: "CeraVe",
    name: "CeraVe Hydrating Cleanser",
    description:
      "A non-foaming daily facial cleanser developed for normal to dry skin that helps remove dirt, sunscreen, and light makeup without disrupting the skin barrier. It supports skin comfort with ceramides and hydration-focused ingredients to reduce tightness after cleansing. How to apply: Wet face with lukewarm water, massage one to two pumps for 30-60 seconds, rinse gently, and follow with moisturizer. Use morning and night.",
    price: 1899,
    category: "cleanser",
    stock_quantity: 40,
    images: [],
    skin_type: ["normal", "dry", "sensitive"],
    skin_concern: ["dryness", "redness"],
    ingredients: "Ceramides, Hyaluronic Acid, Glycerin",
    rating: 4.6,
    is_active: true,
  },
  {
    brandName: "CeraVe",
    name: "CeraVe Foaming Facial Cleanser",
    description:
      "A gel-to-foam cleanser intended for normal to oily skin that needs effective cleansing with a light, refreshed finish. It helps clear daily oil, sweat, and buildup while still supporting barrier care through replenishing ingredients. How to apply: Apply to damp skin, gently lather across face and neck, rinse thoroughly, then continue with serum and moisturizer. Use once or twice daily depending on oiliness.",
    price: 1899,
    category: "cleanser",
    stock_quantity: 38,
    images: [],
    skin_type: ["normal", "oily", "combination"],
    skin_concern: ["pores", "acne"],
    ingredients: "Ceramides, Niacinamide, Hyaluronic Acid",
    rating: 4.5,
    is_active: true,
  },
  {
    brandName: "La Roche-Posay",
    name: "La Roche-Posay Toleriane Hydrating Gentle Cleanser",
    description:
      "A creamy cleanser designed for sensitive skin and daily use, with a focus on mild cleansing and hydration support. It is commonly selected when minimizing irritation and maintaining long-term comfort are routine priorities. How to apply: Massage onto wet skin in circular motions for about 45 seconds, rinse with lukewarm water, and pat dry. Follow with a soothing moisturizer.",
    price: 2499,
    category: "cleanser",
    stock_quantity: 30,
    images: [],
    skin_type: ["dry", "sensitive", "combination"],
    skin_concern: ["dryness", "redness"],
    ingredients: "Ceramide-3, Glycerin, Niacinamide",
    rating: 4.6,
    is_active: true,
  },
  {
    brandName: "La Roche-Posay",
    name: "La Roche-Posay Anthelios Melt-in Milk Sunscreen SPF 100",
    description:
      "A high-protection broad-spectrum sunscreen intended for strong UV exposure and daily prevention of photoaging concerns. The lotion format helps deliver even coverage and reliable defense when used in sufficient quantity. How to apply: Apply generously to face, neck, and exposed skin 15 minutes before sun exposure. Reapply every two hours, and after sweating or washing.",
    price: 3299,
    category: "sunscreen",
    stock_quantity: 24,
    images: [],
    skin_type: ["normal", "dry", "oily", "combination", "sensitive"],
    skin_concern: ["dark_spots", "uneven_tone", "fine_lines"],
    ingredients: "Avobenzone, Homosalate, Octisalate, Octocrylene",
    rating: 4.5,
    is_active: true,
  },
  {
    brandName: "Neutrogena",
    name: "Neutrogena Hydro Boost Water Gel",
    description:
      "A lightweight water-gel moisturizer created for dehydrated skin types that prefer a non-greasy texture. It works as a daily hydration layer to improve smoothness and support a plumper skin feel throughout the day. How to apply: After cleansing and serum, spread a pea-to-dime sized amount over face and neck. Use morning and evening; daytime use should be followed by sunscreen.",
    price: 1999,
    category: "moisturizer",
    stock_quantity: 42,
    images: [],
    skin_type: ["normal", "oily", "combination"],
    skin_concern: ["dryness", "dull_skin"],
    ingredients: "Hyaluronic Acid, Glycerin, Dimethicone",
    rating: 4.5,
    is_active: true,
  },
  {
    brandName: "Neutrogena",
    name: "Neutrogena Ultra Sheer Dry-Touch Sunscreen SPF 55",
    description:
      "A broad-spectrum sunscreen with a dry-touch finish designed for everyday wear, especially for users who avoid heavy or sticky SPF textures. It serves as a regular UV defense step to reduce long-term sun damage risk. How to apply: Apply evenly as the final morning skincare step at least 15 minutes before going outdoors, and reapply every two hours during sun exposure.",
    price: 1799,
    category: "sunscreen",
    stock_quantity: 34,
    images: [],
    skin_type: ["normal", "oily", "combination"],
    skin_concern: ["dark_spots", "fine_lines", "uneven_tone"],
    ingredients: "Avobenzone, Homosalate, Octisalate, Octocrylene",
    rating: 4.4,
    is_active: true,
  },
  {
    brandName: "Cetaphil",
    name: "Cetaphil Gentle Skin Cleanser",
    description:
      "A soap-free cleanser for face and body that is widely used on sensitive skin needing low-irritation cleansing. It removes impurities while helping preserve skin softness and moisture comfort over frequent use. How to apply: Use on wet skin, massage gently for 30-60 seconds, rinse, and pat dry. It can be used morning and night.",
    price: 1699,
    category: "cleanser",
    stock_quantity: 33,
    images: [],
    skin_type: ["normal", "dry", "sensitive"],
    skin_concern: ["dryness", "redness"],
    ingredients: "Glycerin, Niacinamide, Panthenol",
    rating: 4.5,
    is_active: true,
  },
  {
    brandName: "Cetaphil",
    name: "Cetaphil Moisturizing Lotion",
    description:
      "A daily lightweight moisturizer formulated to provide lasting hydration without a heavy finish. It is commonly used to support barrier maintenance in simple morning and evening skincare routines. How to apply: Apply evenly on clean, slightly damp skin. Reapply on dry areas as needed and pair with sunscreen in daytime routines.",
    price: 1799,
    category: "moisturizer",
    stock_quantity: 31,
    images: [],
    skin_type: ["normal", "dry", "sensitive"],
    skin_concern: ["dryness", "dull_skin"],
    ingredients: "Avocado Oil, Vitamin E, Glycerin",
    rating: 4.4,
    is_active: true,
  },
  {
    brandName: "The Ordinary",
    name: "The Ordinary Niacinamide 10% + Zinc 1%",
    description:
      "A concentrated treatment serum focused on visible oil control and smoother-looking texture. It is frequently used in routines addressing congestion, enlarged-looking pores, and uneven tone concerns. How to apply: Apply two to three drops after cleansing and before heavier creams, preferably morning and evening. Avoid layering in the same routine with strong direct acids if skin is easily irritated.",
    price: 1399,
    category: "serum",
    stock_quantity: 50,
    images: [],
    skin_type: ["oily", "combination", "normal"],
    skin_concern: ["pores", "acne", "uneven_tone"],
    ingredients: "Niacinamide, Zinc PCA",
    rating: 4.6,
    is_active: true,
  },
  {
    brandName: "The Ordinary",
    name: "The Ordinary Hyaluronic Acid 2% + B5",
    description:
      "A hydration-oriented serum combining multiple forms of hyaluronic acid with vitamin B5 to support a softer, more supple skin feel. It is commonly layered under moisturizer to reduce dehydration-related tightness. How to apply: Use two to three drops on damp skin after cleansing, then seal with moisturizer. Can be used both morning and evening.",
    price: 1499,
    category: "serum",
    stock_quantity: 46,
    images: [],
    skin_type: ["normal", "dry", "oily", "combination", "sensitive"],
    skin_concern: ["dryness", "fine_lines", "dull_skin"],
    ingredients: "Hyaluronic Acid, Vitamin B5",
    rating: 4.5,
    is_active: true,
  },
  {
    brandName: "Paula's Choice",
    name: "Paula's Choice Skin Perfecting 2% BHA Liquid Exfoliant",
    description:
      "A leave-on salicylic acid exfoliant designed to unclog pores and improve rough, uneven texture with consistent use. It is often selected for blackheads, dullness, and congestion-prone skin concerns. How to apply: After cleansing, apply a small amount with clean hands or cotton pad, avoid eye area, and do not rinse. Start every other night and increase gradually as tolerated.",
    price: 3499,
    category: "toner",
    stock_quantity: 21,
    images: [],
    skin_type: ["normal", "oily", "combination"],
    skin_concern: ["pores", "acne", "dull_skin"],
    ingredients: "Salicylic Acid, Green Tea Extract, Methylpropanediol",
    rating: 4.8,
    is_active: true,
  },
  {
    brandName: "Bioderma",
    name: "Bioderma Sensibio H2O Micellar Water",
    description:
      "A no-rinse micellar cleanser for sensitive skin made to remove makeup and daily impurities while respecting skin comfort. It is often used as a first cleanse or gentle cleanse option for reactive skin routines. How to apply: Saturate a cotton pad, sweep across face and eyes until clean, then optionally follow with water-based cleanser at night.",
    price: 2299,
    category: "cleanser",
    stock_quantity: 28,
    images: [],
    skin_type: ["normal", "dry", "sensitive", "combination"],
    skin_concern: ["redness", "dryness"],
    ingredients: "Micellar Surfactants, Cucumber Extract",
    rating: 4.7,
    is_active: true,
  },
  {
    brandName: "Bioderma",
    name: "Bioderma Atoderm Intensive Baume",
    description:
      "A rich balm for very dry and irritation-prone skin formulated to deliver long-lasting nourishment and barrier support. It is positioned for regular use when skin needs comfort from persistent dryness and rough texture. How to apply: Apply a moderate layer on clean skin once or twice daily, especially after bathing or washing when skin is still slightly damp.",
    price: 2899,
    category: "moisturizer",
    stock_quantity: 19,
    images: [],
    skin_type: ["dry", "sensitive", "normal"],
    skin_concern: ["dryness", "redness"],
    ingredients: "Niacinamide, Skin Barrier Lipids",
    rating: 4.6,
    is_active: true,
  },
  {
    brandName: "Eucerin",
    name: "Eucerin Advanced Repair Cream",
    description:
      "A repairing moisturizer for very dry skin that focuses on smoothing rough texture and replenishing moisture. It is commonly used for ongoing body and face care where barrier reinforcement is needed. How to apply: Massage into dry areas daily, especially elbows, knees, and cheeks. For best results, apply after cleansing while skin is slightly damp.",
    price: 2699,
    category: "moisturizer",
    stock_quantity: 24,
    images: [],
    skin_type: ["dry", "normal", "sensitive"],
    skin_concern: ["dryness", "dull_skin"],
    ingredients: "Urea, Ceramides, Natural Moisturizing Factors",
    rating: 4.5,
    is_active: true,
  },
  {
    brandName: "Eucerin",
    name: "Eucerin Sun Age Defense SPF 50",
    description:
      "A daily facial sunscreen created to combine broad UV protection with anti-aging support for sun-exposed skin. It helps reduce UV-related dark spots and supports healthier skin appearance long term. How to apply: Apply as the final step in your morning routine across face and neck, then reapply every two hours during prolonged daylight exposure.",
    price: 2999,
    category: "sunscreen",
    stock_quantity: 20,
    images: [],
    skin_type: ["normal", "dry", "combination", "sensitive"],
    skin_concern: ["dark_spots", "fine_lines", "uneven_tone"],
    ingredients: "UVA/UVB Filters, Hyaluronic Acid, Antioxidants",
    rating: 4.4,
    is_active: true,
  },
];

const dummyUsers = [
  {
    full_name: "Sushila Karki",
    email: "sushila.karki@example.com",
    phone: "9841001001",
    password: "Password@123",
    role: "user",
    gender: "female",
    skin_type: "dry",
    address: { street: "Putalisadak", city: "Kathmandu", province: "Bagmati" },
    is_verified: true,
    is_active: true,
  },
  {
    full_name: "Ramesh Adhikari",
    email: "ramesh.adhikari@example.com",
    phone: "9841001002",
    password: "Password@123",
    role: "user",
    gender: "male",
    skin_type: "oily",
    address: { street: "Lakeside", city: "Pokhara", province: "Gandaki" },
    is_verified: true,
    is_active: true,
  },
  {
    full_name: "Nirmala Shrestha",
    email: "nirmala.shrestha@example.com",
    phone: "9841001003",
    password: "Password@123",
    role: "user",
    gender: "female",
    skin_type: "sensitive",
    address: { street: "Naxal", city: "Kathmandu", province: "Bagmati" },
    is_verified: true,
    is_active: true,
  },
  {
    full_name: "Bikash Thapa",
    email: "bikash.thapa@example.com",
    phone: "9841001004",
    password: "Password@123",
    role: "user",
    gender: "male",
    skin_type: "combination",
    address: { street: "Narayangarh", city: "Chitwan", province: "Bagmati" },
    is_verified: true,
    is_active: true,
  },
  {
    full_name: "Pratima Gurung",
    email: "pratima.gurung@example.com",
    phone: "9841001005",
    password: "Password@123",
    role: "user",
    gender: "female",
    skin_type: "normal",
    address: { street: "Buddhanagar", city: "Kathmandu", province: "Bagmati" },
    is_verified: true,
    is_active: true,
  },
];

const dummyDoctors = [
  {
    user: {
      full_name: "Dr. Manish Poudel",
      email: "dr.manish.poudel@example.com",
      phone: "9851002001",
      password: "Password@123",
      role: "doctor",
      gender: "male",
      is_verified: true,
      is_active: true,
      address: { street: "Baneshwor", city: "Kathmandu", province: "Bagmati" },
    },
    profile: {
      specialization: "Dermatologist",
      license_number: "NMC-DERM-1001",
      years_of_experience: 9,
      consultation_fee: 1800,
      bio: "Experienced dermatologist focused on acne, pigmentation, and skin barrier care.",
      education: [
        { degree: "MBBS", institution: "Institute of Medicine", year: 2012 },
        { degree: "MD Dermatology", institution: "NAMS", year: 2018 },
      ],
      certifications: ["Clinical Dermoscopy", "Laser Safety"],
      availability_hours: {
        monday: { start: "10:00", end: "16:00" },
        wednesday: { start: "10:00", end: "16:00" },
        friday: { start: "10:00", end: "16:00" },
      },
      is_available: true,
      rating: 4.7,
      total_reviews: 63,
      approval_status: "approved",
      approved_at: new Date(),
    },
  },
  {
    user: {
      full_name: "Dr. Srijana Basnet",
      email: "dr.srijana.basnet@example.com",
      phone: "9851002002",
      password: "Password@123",
      role: "doctor",
      gender: "female",
      is_verified: true,
      is_active: true,
      address: { street: "Birtamode", city: "Jhapa", province: "Koshi" },
    },
    profile: {
      specialization: "Cosmetic Dermatologist",
      license_number: "NMC-DERM-1002",
      years_of_experience: 7,
      consultation_fee: 2200,
      bio: "Cosmetic dermatologist working on melasma, anti-aging, and personalized skincare plans.",
      education: [
        { degree: "MBBS", institution: "BPKIHS", year: 2014 },
        {
          degree: "MD Dermatology",
          institution: "KIST Medical College",
          year: 2019,
        },
      ],
      certifications: ["Chemical Peel Practitioner", "Aesthetic Dermatology"],
      availability_hours: {
        tuesday: { start: "09:00", end: "15:00" },
        thursday: { start: "09:00", end: "15:00" },
        saturday: { start: "09:00", end: "13:00" },
      },
      is_available: true,
      rating: 4.8,
      total_reviews: 51,
      approval_status: "approved",
      approved_at: new Date(),
    },
  },
  {
    user: {
      full_name: "Dr. Kiran Maharjan",
      email: "dr.kiran.maharjan@example.com",
      phone: "9851002003",
      password: "Password@123",
      role: "doctor",
      gender: "male",
      is_verified: true,
      is_active: true,
      address: { street: "Patan", city: "Lalitpur", province: "Bagmati" },
    },
    profile: {
      specialization: "Skin Specialist",
      license_number: "NMC-DERM-1003",
      years_of_experience: 11,
      consultation_fee: 2000,
      bio: "Skin specialist handling eczema, chronic dryness, and inflammatory skin conditions.",
      education: [
        { degree: "MBBS", institution: "Kathmandu University", year: 2011 },
        { degree: "MD Dermatology", institution: "TUTH", year: 2016 },
      ],
      certifications: [
        "Atopic Dermatitis Management",
        "Clinical Patch Testing",
      ],
      availability_hours: {
        monday: { start: "11:00", end: "17:00" },
        thursday: { start: "11:00", end: "17:00" },
        sunday: { start: "10:00", end: "14:00" },
      },
      is_available: true,
      rating: 4.6,
      total_reviews: 74,
      approval_status: "approved",
      approved_at: new Date(),
    },
  },
];

const skinCareTreatments = [
  {
    name: "Hydra Facial Therapy",
    slug: "hydra-facial-therapy",
    description:
      "A multi-step hydration-focused facial that combines gentle exfoliation, pore cleansing, and moisture infusion for smoother and brighter skin.",
    price: 4500,
    image_url: `${clientBaseUrl}/treatments/hydrafacial.jpg`,
    benefit_tags: ["hydration", "glow", "texture"],
    duration_minutes: 60,
    is_active: true,
  },
  {
    name: "Acne Clarifying Chemical Peel",
    slug: "acne-clarifying-chemical-peel",
    description:
      "A dermatologist-supervised peel treatment for acne-prone skin that helps reduce congestion, post-acne marks, and rough texture.",
    price: 5500,
    image_url: `${clientBaseUrl}/treatments/acne-clarifying-chemical.jpg`,
    benefit_tags: ["acne", "pores", "texture"],
    duration_minutes: 45,
    is_active: true,
  },
  {
    name: "Brightening Pigmentation Care",
    slug: "brightening-pigmentation-care",
    description:
      "A targeted treatment plan for uneven tone and dark spots with clinically guided brightening and barrier-safe support steps.",
    price: 6000,
    image_url: `${clientBaseUrl}/treatments/brightening-pigmentation.jpg`,
    benefit_tags: ["brightening", "dark-spots", "even-tone"],
    duration_minutes: 50,
    is_active: true,
  },
  {
    name: "Sensitive Skin Barrier Repair Session",
    slug: "sensitive-skin-barrier-repair-session",
    description:
      "A calming protocol for reactive skin that emphasizes barrier repair, hydration layering, and redness-soothing techniques.",
    price: 4200,
    image_url: `${clientBaseUrl}/treatments/skin-barrier.jpg`,
    benefit_tags: ["barrier", "calming", "redness"],
    duration_minutes: 55,
    is_active: true,
  },
  {
    name: "Anti-Aging Collagen Boost Therapy",
    slug: "anti-aging-collagen-boost-therapy",
    description:
      "A rejuvenation session designed to support firmness and soften fine-line appearance with age-supportive clinical skincare steps.",
    price: 7000,
    image_url: `${clientBaseUrl}/treatments/anti-aging-treatments.jpg`,
    benefit_tags: ["anti-aging", "firmness", "fine-lines"],
    duration_minutes: 70,
    is_active: true,
  },
];

const seedDummyCatalog = async () => {
  const transaction = await connection.transaction();

  try {
    const brandIdByName = new Map();
    let createdBrands = 0;
    let updatedBrands = 0;

    for (const brand of realBrands) {
      const [createdOrFoundBrand, created] = await brandModel.findOrCreate({
        where: { name: brand.name },
        defaults: brand,
        transaction,
      });

      if (created) {
        createdBrands += 1;
      } else {
        await createdOrFoundBrand.update(brand, { transaction });
        updatedBrands += 1;
      }

      brandIdByName.set(brand.name, createdOrFoundBrand.brand_id);
    }

    let insertedProducts = 0;
    let updatedProducts = 0;
    for (const product of realProducts) {
      const brandId = brandIdByName.get(product.brandName);
      if (!brandId) {
        throw new Error(`Brand not found while seeding: ${product.brandName}`);
      }

      const payload = {
        ...product,
        brand_id: brandId,
      };
      delete payload.brandName;

      const [existingProduct, created] = await productModel.findOrCreate({
        where: {
          name: payload.name,
          brand_id: payload.brand_id,
        },
        defaults: payload,
        transaction,
      });

      if (created) {
        insertedProducts += 1;
      } else {
        await existingProduct.update(payload, { transaction });
        updatedProducts += 1;
      }
    }

    let insertedUsers = 0;
    for (const user of dummyUsers) {
      const [, created] = await userModel.findOrCreate({
        where: { email: user.email },
        defaults: user,
        transaction,
      });

      if (created) insertedUsers += 1;
    }

    let insertedDoctors = 0;
    let updatedDoctors = 0;
    for (const doctor of dummyDoctors) {
      const [doctorUser] = await userModel.findOrCreate({
        where: { email: doctor.user.email },
        defaults: doctor.user,
        transaction,
      });

      const [doctorProfile, createdProfile] =
        await doctorProfileModel.findOrCreate({
          where: { user_id: doctorUser.user_id },
          defaults: {
            user_id: doctorUser.user_id,
            ...doctor.profile,
          },
          transaction,
        });

      if (createdProfile) {
        insertedDoctors += 1;
      } else {
        await doctorProfile.update(
          {
            ...doctor.profile,
            user_id: doctorUser.user_id,
          },
          { transaction },
        );
        updatedDoctors += 1;
      }
    }

    let insertedTreatments = 0;
    let updatedTreatments = 0;
    for (const treatment of skinCareTreatments) {
      const [savedTreatment, created] = await treatmentModel.findOrCreate({
        where: { slug: treatment.slug },
        defaults: treatment,
        transaction,
      });

      if (created) {
        insertedTreatments += 1;
      } else {
        await savedTreatment.update(treatment, { transaction });
        updatedTreatments += 1;
      }
    }

    await transaction.commit();
    console.log("Seeding completed successfully.");
    console.log(`Brands created: ${createdBrands}, updated: ${updatedBrands}`);
    console.log(
      `Products inserted: ${insertedProducts}, updated: ${updatedProducts}`,
    );
    console.log(`Users inserted: ${insertedUsers}`);
    console.log(
      `Doctors inserted: ${insertedDoctors}, updated: ${updatedDoctors}`,
    );
    console.log(
      `Treatments inserted: ${insertedTreatments}, updated: ${updatedTreatments}`,
    );
  } catch (error) {
    await transaction.rollback();
    console.error("Failed to seed real catalog:", error.message);
    process.exitCode = 1;
  } finally {
    await connection.close();
  }
};

seedDummyCatalog();
