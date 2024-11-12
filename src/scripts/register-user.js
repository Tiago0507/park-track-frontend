document.getElementById("user-type").addEventListener("change", function () {
    const userType = this.value;
    document.getElementById("evaluatorFields").style.display = userType === "evaluator" ? "block" : "none";
    document.getElementById("evaluatedFields").style.display = userType === "evaluated" ? "block" : "none";
});

function submitForm() {

}

function resetForm() {
    document.getElementById("userForm").reset();
    document.getElementById("evaluatorFields").style.display = "none";
    document.getElementById("evaluatedFields").style.display = "none";
}
