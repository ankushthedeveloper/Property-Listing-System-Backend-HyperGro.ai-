import { z } from "zod";

export const createPropertySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  type: z.enum(["Apartment", "Villa", "Bungalow", "Plot", "Studio"]),
  price: z.number().positive(),
  state: z.string().min(1),
  city: z.string().min(1),
  areaSqFt: z.number().positive(),
  bedrooms: z.number().int().nonnegative(),
  bathrooms: z.number().int().nonnegative(),
  furnished: z.enum(["Furnished", "Semi-Furnished", "Unfurnished"]),
  availableFrom: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  listedBy: z.enum(["Owner", "Agent", "Builder"]),
  listingType: z.enum(["sale", "rent"]),
  amenities: z.union([z.array(z.string()), z.string().transform(str => str.split("|"))]).optional(),
  tags: z.union([z.array(z.string()), z.string().transform(str => str.split("|"))]).optional(),
  colorTheme: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  isVerified: z.boolean().optional(),
});
