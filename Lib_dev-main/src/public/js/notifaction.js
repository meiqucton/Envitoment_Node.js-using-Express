// Ẩn thông báo sau một khoảng thời gian
document.addEventListener('DOMContentLoaded', () => {
    const errorMessages = document.querySelectorAll('.error-message');
    const successMessages = document.querySelectorAll('.success-message');

    // Ẩn thông báo lỗi sau 5 giây
    errorMessages.forEach(message => {
        setTimeout(() => {
            message.style.display = 'none';
        }, 3000000); // 5 giây
    });

    // Ẩn thông báo thành công sau 5 giây
    successMessages.forEach(message => {
        setTimeout(() => {
            message.style.display = 'none';
        }, 5000); // 5 giây
    });
});
