

const form = document.getElementById("form");

if(form){
    form.onsubmit = async function (e) {
        e.preventDefault();
        const formData = new FormData(form);

        if(formData.get("text").length < 8){
            window.Toastify.showToast({
                text: "Input more than 8 characters",
                duration: 3000,
                newWindow: true,
                gravity: "top", // `top` or `bottom`
                position: "left", // `left`, `center` or `right`
                stopOnFocus: true, // Prevents dismissing of toast on hover
                style: {
                  background: "red",
                  marginTop: "2px",
                  textAlign: "center"
                }})
        }else{
            /*
            // request result from openAI
            const result = await window.axios.openAI(formData.get("text"));
            document.getElementById("keywords").innerHTML = result.choices[0].text;
            */
            
            // Get request of SUpa temp debug
            const aw = await window.axios.supaBase("get");  
            document.getElementById("keywords").innerHTML = aw[0].output;

            let data = {
                'input': formData.get("text"),
                "output": document.getElementById("keywords").innerHTML
            }

            await window.axios.supaBase("post",data);
        }
    }
}
 