document.addEventListener("DOMContentLoaded", () => {
  const menuButton = document.querySelector(".menue");
  const navMenu = document.querySelector(".na");

  menuButton.addEventListener("click", () => {
    navMenu.classList.toggle("show"); // Toggles the `show` class to display/hide the menu
  });
});



const notAouth = document.querySelectorAll(".notAouth");
const isAuth = document.querySelectorAll(".isAuth");
const logoutbtn = document.querySelector(".logout")
function cheakAuth() {
  const token = localStorage.getItem("token");
  const form = {
    token: token,
  };

  if (token) {
    axios.post("http://localhost:3000/validateToken", form)
      .then((response) => {
        notAouth.forEach((element) => {
          element.style.display = "none";
        });
        isAuth.forEach((element) => {
          element.style.display = "block";
        });
      })
      .catch((error) => {
        // If the token is invalid
        notAouth.forEach((element) => {
          element.style.display = "block";
        });
        isAuth.forEach((element) => {
          element.style.display = "none";
        });
      });
  } else {
    // If there is no token
    notAouth.forEach((element) => {
      element.style.display = "block";
    });
    isAuth.forEach((element) => {
      element.style.display = "none";
    });
  }
}

cheakAuth();

const signinForm = document.querySelector(".registe");
document.getElementById("signbtn").addEventListener("click", function () {
  signinForm.style.visibility = "visible";
});

document.getElementById("cnsdign").addEventListener("click", function () {
  signinForm.style.visibility = "hidden";
});

const loading = document.querySelector(".loading");

const loginfrom = document.querySelector(".login");
document.getElementById("lognbtn").addEventListener("click", function () {
  loginfrom.style.visibility = "visible";
});

document.getElementById("cnslog").addEventListener("click", function () {
  loginfrom.style.visibility = "hidden";
});

document.getElementById("btn").addEventListener("click", function () {
  const user = document.getElementById("user").value;
  const email = document.getElementById("email").value;
  const phoneNumber = document.getElementById("phoneNumber").value;
  const password = document.getElementById("password").value;

  if (phoneNumber.length > 10) {
    return erroralert("please enter vailed number ");
  }

  loading.style.visibility = "visible";

  const form = {
    username: user,
    email: email,
    password: password,
    mobileNumber: phoneNumber,
  };

  console.log(form);

  axios
    .post("http://localhost:3000/register", form)
    .then((response) => {
      console.log(response.data);
      signinForm.style.visibility = "hidden";
      loading.style.visibility = "hidden";

      const token = response.data.token;
      localStorage.setItem("token", token);
      cheakAuth();
      cheakPay();
      getusername()
      cheakAdmin()
      location.reload()
    })
    .catch((error) => {
      erroralert(`${error.response.data.message}`);
      loading.style.visibility = "hidden";
    });
});

document.querySelector(".btn").addEventListener("click", function () {
  const email = document.getElementById("LogEmail").value;
  const password = document.getElementById("LogPassword").value;
  const form = {
    email: email,
    password: password,
  };
  loading.style.visibility = "visible";
  axios
    .post("http://localhost:3000/login", form)
    .then((response) => {
      loading.style.visibility = "hidden";
      const token = response.data.token;
      localStorage.setItem("token", token);
      loginfrom.style.visibility = "hidden";
      cheakAuth();
      cheakPay();
      getusername()
      cheakAdmin()
      location.reload()
    })
    .catch((error) => {
      loginerror(`${error.response.data.message}`);
      loading.style.visibility = "hidden";
    });
});

function erroralert(text) {
  const error = document.querySelector(".error");
  const errorTxt = document.getElementById("error");
  error.style.visibility = "visible";
  errorTxt.innerHTML = text;
  setTimeout(() => {
    error.style.visibility = "hidden";
  }, 3000);
}

function loginerror(text) {
  const error = document.querySelector(".logerror");
  const errorText = document.getElementById("errorText");
  error.style.display = "block";
  errorText.innerHTML = text;
  setTimeout(() => {
    error.style.display = "none";
  }, 3000);
}

logoutbtn.addEventListener("click", function () {
  const token = localStorage.getItem("token");

  const form = {
    token: token,
  };
  loading.style.visibility = "visible";
  axios
    .post("http://localhost:3000/logout", form)
    .then((response) => {
      loading.style.visibility = "hidden";
      localStorage.removeItem("token");
      cheakAuth();
      location.reload()
    })
    .catch((error) => {
      alert(error.response.data.message);
    });
});

let course = false;

async function cheakPay() {
  const token = localStorage.getItem("token");

  if (token) {
    const form = {
      token: token,
    };
    loading.style.visibility = "visible";
    

    try {
      const response = await axios.post("http://localhost:3000/checkIsPay", form);
      const isPay = response.data.isPay;
      loading.style.visibility = "hidden";

      course = isPay;
    } catch (error) {
      console.log(error.response ? error.response.message : error.message);
      loading.style.visibility = "hidden";

    }
  }
}

// استدعاء الدالة وتحديث القيمة بعد التحقق من التوكن
async function checkAndPrintCourse() {
  await cheakPay();
  const list = document.querySelector(".Allvidios-list")
  
  let content = `

   <div class="video-loack " data-src="/frontend/img/videoplayback.mp4" onclick="videochose(this)" >
    <div class="vid" >
        <div class="vidicon">
            <i class="fa-solid fa-play"></i>
        </div>
    </div>

    <div class="video-title">
        <h1>video1</h1>
    </div>
</div>

  `

  let content2 = `

  <div class="video-loack" data-src="/frontend/img/Arcane「AMV」GODS ft. NewJeans.mp4" onclick="videochose(this)">
   <div class="vid" >
       <div class="vidicon">
           <i class="fa-solid fa-play"></i>
       </div>
   </div>

   <div class="video-title">
       <h1>video1</h1>
   </div>
</div>

 `

  if(course == true){
        list.innerHTML = ""
        list.innerHTML +=  content
        list.innerHTML +=  content
        list.innerHTML +=  content2
        list.innerHTML +=  content2
        list.innerHTML +=  content2
        list.innerHTML +=  content2
      
      document.getElementById("payment").style.display = 'none'
  }


}

checkAndPrintCourse();

// تحديد العنصر الأب الذي يحتوي على عناصر .video-loack
const parentContainer = document.querySelector(".Allvidios-list") // أو أي عنصر أب يحتوي على العناصر

const videoPlayer = document.getElementById('videoPlayerr');
const videoSource = document.getElementById('videoSource');

// إضافة حدث عند الضغط على أي عنصر بـ .video-loack حتى لو أُضيف بعد التنفيذ
parentContainer.addEventListener('click', (event) => {
    const lock = event.target.closest('.video-loack');
    
    if (lock) {
        const videoSrc = lock.getAttribute('data-src');
        
        if (videoSrc) {
            // تحديث مصدر الفيديو في المشغل
            videoSource.src = videoSrc;
            
            // إعادة تحميل الفيديو وتشغيله
            videoPlayer.load();
            videoPlayer.play();
        } else {
            console.error('لا يوجد مصدر للفيديو في العنصر المحدد.');
        }
    }
});


document.querySelector(".btn1").addEventListener("click",function(){
  window.location = '#Course'
})

document.querySelector(".btn2").addEventListener("click",function(){
  window.location = '#about'
})

function videochose(el){
  console.log(el)
  const allVideos = document.querySelectorAll(".active")
  for(element of allVideos){
    element.classList.remove("active")
  }
  el.classList.add("active")
}

function getusername (){
  const name = document.getElementById("usernamespan")
   const mobileNumber = document.getElementById("usernumber")
  const token = localStorage.getItem("token")

  const form = {
    "token":token
  }
  if(token){
    loading.style.visibility = "visible"
    axios.post("http://localhost:3000/getUserDetails",form)
    .then((response)=>{
      name.innerHTML = response.data.username
      mobileNumber.innerHTML = response.data.mobileNumber
      loading.style.visibility = "hidden"
    
    })
  }else{
    name.innerHTML = ""
  }
  
}


getusername()


// chose evc //
document.querySelector(".evcBtn").addEventListener("click",function(){
  document.querySelector(".evcBtn").style.background = "var(--main-color)"
  document.querySelector(".edahaBtn").style.background = "#e9e9e9"
  
  document.querySelector(".stage2-evc").style.display = 'flex'
  document.querySelector(".stage2-edahab").style.display = 'none'


})

// chose evc //

// chose edahab // 

document.querySelector(".edahaBtn").addEventListener("click",function(){
  document.querySelector(".edahaBtn").style.background = "var(--main-color)"
  document.querySelector(".evcBtn").style.background = "#e9e9e9"
    document.querySelector(".stage2-evc").style.display = 'none'
  document.querySelector(".stage2-edahab").style.display = 'flex'

})

// chose edahab // 

// camsole payment //

document.querySelector(".bx-x").addEventListener("click",()=>{
  document.querySelector(".payment").style.display = 'none'
   document.querySelector(".edahaBtn").style.background = "#e9e9e9"
  document.querySelector(".evcBtn").style.background = "#e9e9e9"
  document.querySelector(".stage2-edahab").style.display = 'none'
  document.querySelector(".stage2-evc").style.display = 'none'
  document.querySelector(".stage3").style.display = 'none'
  document.querySelector(".stage1").style.display = 'flex'


})

// camsole payment //


document.getElementById("next").addEventListener("click",function(){

  const nextbtn =  document.getElementById("next")

  if(nextbtn.innerHTML == 'Next'){
      document.querySelector(".stage1").style.display =  'none'
      document.querySelector(".stage3").style.display =  'flex'
      document.getElementById("next").innerHTML = 'Back'
      document.querySelector(".stage2-edahab").style.display = 'none'
      document.querySelector(".stage2-evc").style.display = 'none'
      document.querySelector(".edahaBtn").style.background = "#e9e9e9"
      document.querySelector(".evcBtn").style.background = "#e9e9e9"
  }
  else if(nextbtn.innerHTML == 'Back'){
    document.querySelector(".stage1").style.display =  'flex'
    document.querySelector(".stage3").style.display =  'none'
    document.getElementById("next").innerHTML = 'Next'
  }
})



document.getElementById("payment").addEventListener("click",()=>{
  const token = localStorage.getItem("token")
  if(!token){
    return loginfrom.style.visibility = 'visible'
  }

  const form = {
    "token":token
  }

  axios.post("http://localhost:3000/validateToken",form)
  .then((response)=>{
    console.log(response.data)
  document.querySelector(".payment").style.display = "flex"

  }).catch((err)=>{
    return loginfrom.style.visibility = 'visible'
  })
})


function cheakAdmin(){

  const token = localStorage.getItem("token")
  axios.post("http://localhost:3000/checkAdmin",{
    "token":token
  })
.then((response) => {
 const adminStatus = response.data.isAdmin
 if(adminStatus == true){
   const content = `
   <ul>
  <li>
  <a href="./admin.html">Admin</a>
  </li>
  </ul>
  `
  
  document.querySelector(".na").innerHTML += content
}

}).catch((err) => {
  console.log("")
  
});
}


cheakAdmin()