# Quên mật khẩu

## Bước 1

Front-end: render Form quên mật khẩu -> Trường email
Khi user nhập email, bấm submit --> Gọi api POST / auth / forgot-password

- Kiểm tra email có tồn tại trong bảng user không ?
- Tạo mã OTP --> lưu vào redis (đặt thời gian 1 phút, key: otp, value: user.id)
- Trả về Response cho front-end: Yêu cầu user check mail

## Bước 2

Front-end: render Form mới có trường nhập OTP => Khi user nhập OTP ==> Gọi API POST / auth / verify-otp

- Kiểm tra otp trên redis
- Trả về Responese cho front-end

## Bước 3

Front-end: Render form có 2 trường: Mật khẩu mới và nhập lại mật khẩu mới ==> Khi user nhập mật khẩu và submit ==> gọi API PUT /auth/reset-password

- Check xem 2 mật khẩu có khớp nhau không ?
- Verify lại otp 1 lần nữa để lấy ra được userId cần update
- Cập nhật vào bảng users mật khẩu mới (Mã hóa mật khẩu trước khi update)
- Gửi cho user email
- xóa otp trên redis
