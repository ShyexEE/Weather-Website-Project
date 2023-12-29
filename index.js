import express from "express";
import axios from "axios";
import bodyParser from "body-parser";


const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("index.ejs");
});


app.post("/post-location", async (req, res) => {
  const searchLocation= req.body;
  const location = searchLocation.location.replace(/ /g,"%20")
  try{
  const result = await axios.get(`https://api.geoapify.com/v1/geocode/search?text=${location}&apiKey=1616fd32fe0b487dad8bfd3b5e742f36`);
  const loc = result.data.features
  var longitude = loc[0].properties["lon"];
  var latitude = loc[0].properties["lat"];
  var city= loc[0].properties["city"];
  var country = loc[0].properties["country"];
} catch (error) {
  res.render("index.ejs", { content: JSON.stringify(error.response.data) });
}

try{
  const weather= await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=is_day,rain&hourly=temperature_2m&timezone=auto&forecast_days=1`)
  const time= await axios.get(`https://timeapi.io/api/Time/current/coordinate?latitude=${latitude}&longitude=${longitude}`)
  const temp = weather.data.hourly["temperature_2m"][0]
  const temperature = Math.floor(temp)
  if (weather.data.current["is_day"]===0){
    res.render("night.ejs", {
      city: city,
      country: country,
      time: time.data.time,
      temp: temperature,
      date: time.data.date,
      weekday: time.data.dayOfWeek,
    });
  };

  if (weather.data.current["is_day"]!==0){
    res.render("day.ejs",{
    city: city,
    country: country,
    time: time.data.time,
    temp: temperature,
    date: time.data.date,
    weekday: time.data.dayOfWeek,
    })
  }
} catch (error) {
  res.render("index.ejs", { content: JSON.stringify(error.response.data) });
}
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
  