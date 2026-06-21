import { z } from "zod";

export const checkoutItemSchema = z.object({
  productId: z.string(),
  flavor: z.string().optional(),
  size: z.string().optional(),
  message: z.string().max(60).optional(),
  quantity: z.number().int().min(1).max(50),
});

export const checkoutSchema = z.object({
  customerName: z.string().min(2, "Please enter your name"),
  customerPhone: z.string().min(6, "Please enter a valid phone"),
  customerEmail: z.string().email().optional().or(z.literal("")),
  address: z.string().min(6, "Please enter your full address"),
  city: z.string().optional(),
  deliveryDate: z.string().optional(),
  deliverySlot: z.string().optional(),
  notes: z.string().max(300).optional(),
  paymentMethod: z.enum(["COD", "RAZORPAY"]),
  couponCode: z.string().optional(),
  regionId: z.string().optional(),
  items: z.array(checkoutItemSchema).min(1, "Your cart is empty"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
