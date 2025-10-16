import { z } from 'zod'

// Schema for review user object
export const reviewUserSchema = z.union([
  z.string(),
  z.object({
    username: z.string(),
    profile_picture: z.object({
      url: z.string().url()
    }).nullable().optional()
  })
])

// Schema for review creation
export const reviewCreateSchema = z.object({
  rating: z.number()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5')
    .int('Rating must be a whole number'),
  content: z.string()
    .min(10, 'Review must be at least 10 characters')
    .max(5000, 'Review must be at most 5000 characters')
    .trim()
})

// Schema for review update
export const reviewUpdateSchema = z.object({
  rating: z.number()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5')
    .int('Rating must be a whole number')
    .optional(),
  content: z.string()
    .min(10, 'Review must be at least 10 characters')
    .max(5000, 'Review must be at most 5000 characters')
    .trim()
    .optional()
}).refine(
  (data) => data.rating !== undefined || data.content !== undefined,
  { message: 'At least one field (rating or content) must be provided' }
)

// Type exports
export type ReviewCreateInput = z.infer<typeof reviewCreateSchema>
export type ReviewUpdateInput = z.infer<typeof reviewUpdateSchema>
export type ReviewUserType = z.infer<typeof reviewUserSchema>
