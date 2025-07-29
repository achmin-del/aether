document.getElementById("saranForm").addEventListener("submit", function (e) {
  const nama = document.getElementById("nama").value.trim();
  const subjectField = document.getElementById("subjectField");

  if (nama) {
    subjectField.value = `Saran dari ${nama}`;
  }
});
