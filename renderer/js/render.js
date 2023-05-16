

const form = document.getElementById("form");

if(form){
    form.onsubmit = async function (e) {
        e.preventDefault();
        const formData = new FormData(form);
        // document.getElementById("keywords").innerHTML = formData.get("text");
        const result = await window.axios.openAI(formData.get("text"));
        document.getElementById("keywords").innerHTML = result.choices[0].text;
        // console.log(window.axios.supaBase());
    }
}
