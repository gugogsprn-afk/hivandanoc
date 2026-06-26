/**
 * Contacts / locations page map — delegates to ClinicMap (Google Maps Marker).
 */
const ContactMap = (function () {
  function setContactLinks(h) {
    const hospital = h || {};
    const addr =
      typeof ClinicMap !== 'undefined' && ClinicMap.clinicAddress
        ? ClinicMap.clinicAddress(hospital)
        : hospital.address || '';
    const directions =
      typeof HospitalApp !== 'undefined' && HospitalApp.mapDirectionsUrl
        ? HospitalApp.mapDirectionsUrl(hospital)
        : '#';
    const addrEl = document.getElementById('contact-map-address');
    if (addrEl) addrEl.textContent = addr;
    const dirEl = document.getElementById('contact-map-directions');
    if (dirEl) dirEl.href = directions;
  }

  function render(container, h) {
    if (!container) return;
    const hospital =
      h || (typeof HospitalApp !== 'undefined' ? HospitalApp.getData()?.hospital : {}) || {};
    if (typeof ClinicMap !== 'undefined') {
      ClinicMap.render(container, hospital).then(() => setContactLinks(hospital));
      return;
    }
    if (typeof HospitalApp !== 'undefined' && HospitalApp.renderHospitalMap) {
      HospitalApp.renderHospitalMap(container, hospital);
    }
    setContactLinks(hospital);
  }

  return { render };
})();
