import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string()
    .trim()
    .email('Email không hợp lệ'),

  password: z.string()
    .min(6, 'Mật khẩu tối thiểu 6 ký tự')
    .max(100, 'Mật khẩu tối đa 100 ký tự'),

  confirmPassword: z.string()
    .min(6, 'Xác nhận mật khẩu cần ít nhất 6 ký tự')
    .max(100, 'Xác nhận mật khẩu tối đa 100 ký tự'),

  displayName: z.string()
    .trim()
    .min(4, 'Họ và tên phải có ít nhất 4 ký tự')
    .max(100, 'Tên hiển thị tối đa 100 ký tự'),

  gender: z.preprocess(
    (value) => typeof value === 'string' ? value.trim().toUpperCase() : value,
    z.enum(['MALE', 'FEMALE', 'OTHER'], {
      errorMap: () => ({ message: 'Giới tính không hợp lệ' })
    })
  ).transform((value) => ({ MALE: 0, FEMALE: 1, OTHER: 2 }[value])),

  dateOfBirth: z.string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày sinh không hợp lệ')
    .transform((value) => new Date(value))
    .refine((date) => !Number.isNaN(date.getTime()), { message: 'Ngày sinh không hợp lệ' })
    .refine((date) => {
      const today = new Date()
      const birth = new Date(date)
      const age = today.getFullYear() - birth.getFullYear()
      const monthDiff = today.getMonth() - birth.getMonth()
      const dayDiff = today.getDate() - birth.getDate()
      return age > 13 || (age === 13 && (monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0)))
    }, { message: 'Bạn phải từ 13 tuổi trở lên' }),
}).superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['confirmPassword'],
      message: 'Mật khẩu xác nhận không khớp',
    })
  }
})

export const loginSchema = z.object({
  email: z.string()
    .trim()
    .email('Email không hợp lệ'),

  password: z.string()
    .min(1, 'Vui lòng nhập mật khẩu'),
  // Login chỉ cần min(1) — không validate độ phức tạp
})

// updateProfileSchema dùng .partial() — tất cả field đều optional
// User có thể chỉ cập nhật displayName mà không cần gửi bio
export const updateProfileSchema = z.object({
  displayName: z.string().trim().min(1).max(100).optional(),
  bio: z.string().trim().max(500, 'Bio tối đa 500 ký tự').optional(),
  gender: z.number().int().min(0).max(2).optional(),
  dateOfBirth: z.string().datetime({ offset: true }).optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'Cần ít nhất một field để cập nhật' }
  // .refine() là custom validation — chặn request body rỗng {}
)

// updateUsernameSchema — chỉ cho phép đặt/đổi username
export const updateUsernameSchema = z.object({
  username: z.string()
    .trim()
    .min(3, 'Username tối thiểu 3 ký tự')
    .max(30, 'Username tối đa 30 ký tự')
    .regex(/^[a-zA-Z0-9_.]+$/, 'Username chỉ chứa chữ, số, dấu chấm (.) và gạch dưới (_)'),
})
