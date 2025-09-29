
document.addEventListener('DOMContentLoaded', function() {
    const alertsButton = document.getElementById('alertsButton');
    const alertsPopup = document.getElementById('alertsPopup');
    const closePopupButton = document.getElementById('closePopupButton');

    alertsButton.addEventListener('click', function() {
        alertsPopup.style.display = 'block';
    });

    closePopupButton.addEventListener('click', function() {
        alertsPopup.style.display = 'none';
    });
});
