// All content lives here, so the app works fully offline.
// Opening hours and timetables change by season: confirm the day before.
window.SV_DATA = {
  itinerary: [
    {
      day: 1, region: "Stockholm", title: "Old town, slow start",
      sw: "Gamla stan",
      summary: "Arrive, drop your bags and wander the cobbled lanes of Gamla Stan. No museums today, just getting your bearings with a warm drink in hand.",
      stops: [
        { t: "Morning", name: "Arrive & check in", blurb: "Arlanda Express or the commuter train (pendeltåg) takes you to Stockholm Central. Tap a contactless card at the SL gates for metro and buses." },
        { t: "12:00", name: "Stortorget", place: "stortorget", blurb: "The colourful square at the heart of the old town. Look for the deep-red and ochre gabled houses." },
        { t: "13:00", name: "Fika at Kaffekoppen", place: "kaffekoppen", blurb: "Candlelit vaulted cellar right on the square. Order a kanelbulle and a bryggkaffe (filter coffee, usually with free refills)." },
        { t: "14:30", name: "Royal Palace & Storkyrkan", place: "palace", blurb: "Catch the changing of the guard around midday, then step into the cathedral for the St George and the Dragon sculpture." },
        { t: "16:00", name: "Mårten Trotzigs gränd", blurb: "Stockholm's narrowest alley, just 90 cm at its tightest. Lovely in the lamplight." },
        { t: "Sunset", name: "Riddarholmen viewpoint", place: "riddarholmen", blurb: "Walk to the western quay and watch the light fade over Riddarfjärden and City Hall." }
      ],
      fika: "Kaffekoppen, Stortorget",
      cozy: "Buy a pair of thick wool socks in one of the old-town shops and wear them all evening.",
      transport: "Everything is walkable. Gamla Stan metro station is at the edge of the island.",
      winter: "It gets dark by mid-afternoon in late autumn and winter. That's when the old town is at its most magical, with candles in every window.",
      summer: "Light until 10 pm. Push the viewpoint walk late and grab an ice cream on the quay."
    },
    {
      day: 2, region: "Stockholm", title: "Djurgården: ships, gardens & cinnamon",
      sw: "Djurgården",
      summary: "The green royal island. One big museum in the morning, an open-air museum after lunch, and a greenhouse café in between.",
      stops: [
        { t: "09:30", name: "Vasa Museum", place: "vasa", blurb: "A 17th-century warship that sank on its maiden voyage and was raised almost intact. Go at opening to have it nearly to yourself." },
        { t: "12:00", name: "Lunch at Rosendals Trädgård", place: "rosendal", blurb: "Organic garden café in greenhouses. Seasonal soup, sourdough, and cakes on a long wooden table." },
        { t: "14:00", name: "Skansen", place: "skansen", blurb: "Open-air museum of old Swedish farmhouses, craftspeople and Nordic animals (elk, reindeer, lynx)." },
        { t: "16:30", name: "Nordiska museet (optional)", place: "nordiska", blurb: "How Swedes have lived, dressed and celebrated over 500 years. Great on a cold day." },
        { t: "Evening", name: "Ferry back to Slussen", blurb: "The little Djurgården ferry is part of the SL network. Ten minutes on the water, city lights all around." }
      ],
      fika: "Rosendals Trädgård",
      cozy: "Skansen's Christmas market runs on Advent weekends: glögg, smoked sausage, and hand-dipped candles.",
      transport: "Tram 7 from the city or the Djurgården ferry from Slussen.",
      winter: "Rosendal's greenhouse café keeps shorter hours in winter. Check the night before.",
      summer: "Rent a bike at the Djurgården bridge and loop the whole island along the water."
    },
    {
      day: 3, region: "Stockholm", title: "Södermalm views & photography",
      sw: "Södermalm",
      summary: "The creative south island: cliff-top viewpoints, vintage shops and one of the world's great photography museums.",
      stops: [
        { t: "10:00", name: "Monteliusvägen", place: "monteliusvagen", blurb: "A short cliff-edge path with the best view of Gamla Stan and City Hall. Benches for lingering." },
        { t: "11:30", name: "SoFo neighbourhood", blurb: "Streets south of Folkungagatan: vintage clothes, design shops, Nytorget square." },
        { t: "13:00", name: "Fika at Vete-Katten (city)", place: "vetekatten", blurb: "A classic konditori since 1928, with wood-panelled rooms and a proper prinsesstårta. Worth the short metro ride." },
        { t: "15:00", name: "Fotografiska", place: "fotografiska", blurb: "Photography museum in an old customs house. The top-floor café has a huge window over the water." },
        { t: "Evening", name: "Metro art tour", place: "kungstradgarden", blurb: "Ride the blue line: T-Centralen (blue vines), Kungsträdgården (garden ruins), Solna Centrum (red sky, green forest). It's the longest art gallery in the world." }
      ],
      fika: "Vete-Katten or Fotografiska's top floor",
      cozy: "Get a window seat at Fotografiska at dusk and watch the city light up.",
      transport: "Metro to Slussen or Medborgarplatsen. Fotografiska is a 10-minute walk along the quay.",
      winter: "Fotografiska stays open late most evenings, so it's a perfect dark-afternoon plan.",
      summer: "Swap the metro tour for an evening picnic on Skinnarviksberget, the highest natural point in the city centre."
    },
    {
      day: 4, region: "Archipelago", title: "Into the archipelago",
      sw: "Skärgården",
      summary: "Thirty thousand islands start right at the city's edge. Take a boat to Vaxholm, a wooden-house town with a fortress.",
      stops: [
        { t: "10:00", name: "Boat from Strömkajen", blurb: "Waxholmsbolaget boats leave from in front of the Grand Hôtel. The ride itself is the attraction: red cottages, pine islets, bobbing jetties." },
        { t: "11:30", name: "Vaxholm town", place: "vaxholm", blurb: "Pastel wooden houses, a little harbour and smoked-fish shops." },
        { t: "13:00", name: "Vaxholm Fortress", place: "vaxholm", blurb: "A short ferry hop to the 16th-century fortress island. Walk the walls." },
        { t: "15:00", name: "Fika by the harbour", blurb: "Find a bakery café on the waterfront. In summer, try a strawberry tart." },
        { t: "Evening", name: "Bus 670 back", blurb: "If the boats are sparse, the 670 bus runs back to Tekniska högskolan metro." }
      ],
      fika: "A harbour bakery in Vaxholm",
      cozy: "Sit on the top deck under a blanket. Many boats lend them out.",
      transport: "Waxholmsbolaget boat (summer is more frequent) or bus 670 year-round.",
      winter: "Boats run a reduced timetable. As a backup, take the boat or bus to Drottningholm Palace and its theatre instead.",
      summer: "Push further out to Grinda or Sandhamn and stay a night in a seaside inn."
    },
    {
      day: 5, region: "Uppsala", title: "Uppsala: cathedral, kings & Linnaeus",
      sw: "Uppsala",
      summary: "A 40-minute train to Sweden's old university city. Viking-age burial mounds, the country's largest cathedral and a historic garden.",
      stops: [
        { t: "09:30", name: "Train to Uppsala", blurb: "SJ or SL commuter trains from Stockholm Central (an SL ticket covers the commuter train to Uppsala; check the zone rules)." },
        { t: "10:30", name: "Uppsala Cathedral", place: "uppsaladom", blurb: "The tallest church in Scandinavia, and the resting place of Gustav Vasa and Linnaeus." },
        { t: "12:30", name: "Güntherska", place: "guntherska", blurb: "Old-fashioned konditori with velvet chairs and chandeliers. Lunch and cake." },
        { t: "14:00", name: "Linnaeus Garden", place: "linnaeus", blurb: "The botanist's restored 18th-century garden and home." },
        { t: "15:30", name: "Gamla Uppsala", place: "gamlauppsala", blurb: "Royal burial mounds from the 500s. Walk up at golden hour." }
      ],
      fika: "Güntherska",
      cozy: "Buy a bag of kanelbullar to eat on the train back.",
      transport: "Bus 2 runs from central Uppsala to Gamla Uppsala.",
      winter: "The mounds under frost or snow are hauntingly beautiful. Go before the light goes, around 2–3 pm.",
      summer: "Rent a canoe on the Fyris river, or take a side trip to Sigtuna, Sweden's oldest town."
    },
    {
      day: 6, region: "Dalarna", title: "North to Dalarna & Lake Siljan",
      sw: "Dalarna",
      summary: "The heart of folk Sweden: red cottages, painted horses and the big lake. Stop at the Falun copper mine on the way.",
      stops: [
        { t: "08:30", name: "Train to Falun", blurb: "About 2.5–3 hours from Stockholm. Pack a fika for the journey." },
        { t: "11:30", name: "Falun Copper Mine", place: "falun", blurb: "UNESCO site. The red pigment for Sweden's famous Falu red houses comes from here. Take the guided tour underground." },
        { t: "14:30", name: "Onward to Rättvik", blurb: "Regional train along the lake." },
        { t: "16:00", name: "Långbryggan, Rättvik", place: "rattvik", blurb: "A 628-metre wooden pier out into Lake Siljan. Walk to the end at sunset." },
        { t: "Evening", name: "Stay in a stuga", blurb: "Book a wooden cottage or a farmhouse B&B around the lake (Tällberg is especially pretty)." }
      ],
      fika: "Bring your own on the train",
      cozy: "Light a fire in the cottage stove, make tea and leave the curtains open to the dark lake.",
      transport: "SJ to Falun, then regional train to Rättvik. A car makes Dalarna much easier.",
      winter: "Siljan often freezes in deep winter. Ask locals before you step on the ice; never go alone.",
      summer: "Midsummer in Dalarna is the most traditional in Sweden: maypoles, folk dress and dancing."
    },
    {
      day: 7, region: "Dalarna", title: "Dala horses & Zorn",
      sw: "Mora & Nusnäs",
      summary: "Watch the famous wooden horses being carved and painted, then visit painter Anders Zorn's storybook home.",
      stops: [
        { t: "10:00", name: "Nusnäs workshops", place: "nusnas", blurb: "Watch Dala horses being carved and hand-painted. Paint your own in some workshops." },
        { t: "12:30", name: "Lunch in Mora", blurb: "Look for husmanskost (home-style Swedish food) on the lunch menu: meatballs, pytt i panna, salmon." },
        { t: "13:30", name: "Zorngården & Zorn Museum", place: "zorn", blurb: "Anders Zorn's house is a masterpiece of national-romantic interiors. Guided tours only." },
        { t: "16:00", name: "Vasaloppet finish line", blurb: "The world's oldest big cross-country ski race ends right in Mora." },
        { t: "Evening", name: "Back by the lake", blurb: "Sauna if your stay has one, then a quiet dinner." }
      ],
      fika: "A Mora konditori",
      cozy: "Buy an unpainted Dala horse and paint it yourself over the evening.",
      transport: "Car, or bus between Rättvik, Nusnäs and Mora.",
      winter: "Ask about a horse-drawn sleigh ride or dog sledding near the lake.",
      summer: "Swim from a jetty in Siljan in the evening light."
    },
    {
      day: 8, region: "Gothenburg", title: "West to Gothenburg",
      sw: "Göteborg",
      summary: "A travel day across the country. Arrive in Sweden's friendly west-coast city for an evening in Haga.",
      stops: [
        { t: "Morning", name: "Train to Gothenburg", blurb: "Usually via Stockholm or Örebro, about 5–6 hours. Window seat, book, thermos." },
        { t: "16:00", name: "Check in", blurb: "Stay central (Inom Vallgraven or Haga) so everything is walkable." },
        { t: "17:00", name: "Haga", place: "haga", blurb: "Cobbled street of 19th-century wooden-and-stone houses, cafés and little shops." },
        { t: "19:00", name: "Seafood dinner", blurb: "This is shrimp and oyster country. Try a räksmörgås (open shrimp sandwich)." }
      ],
      fika: "Café Husaren, Haga",
      cozy: "Gothenburg's Christmas season is famous. In Advent, Liseberg turns into a glowing Christmas market.",
      transport: "SJ train to Göteborg Central. Trams cover the whole city.",
      winter: "Liseberg's Christmas market (Jul på Liseberg) is a must if you're here in Advent.",
      summer: "Eat dinner outside at Järntorget or on Andra Långgatan."
    },
    {
      day: 9, region: "Gothenburg", title: "Haga, hills & fish church",
      sw: "Göteborg",
      summary: "Half a day of cafés and viewpoints, half a day of markets and parks.",
      stops: [
        { t: "09:30", name: "Hagabullen at Café Husaren", place: "husaren", blurb: "A cinnamon bun the size of a plate. Share it, or don't." },
        { t: "10:30", name: "Skansen Kronan", place: "skansenkronan", blurb: "Climb the steps behind Haga to a 17th-century fortress with views over the rooftops." },
        { t: "12:00", name: "Feskekôrka", place: "feskekorka", blurb: "A fish market built like a church. Lunch on fish soup or shrimp." },
        { t: "14:00", name: "Röhsska Museum", place: "rohsska", blurb: "Sweden's museum of design and craft. A cozy dose of Scandinavian design history." },
        { t: "16:00", name: "Slottsskogen", place: "slottsskogen", blurb: "A big rambling park with free animal enclosures (seals, elk, penguins)." },
        { t: "Evening", name: "Liseberg (seasonal)", place: "liseberg", blurb: "Amusement park in summer, Christmas wonderland in winter." }
      ],
      fika: "Café Husaren",
      cozy: "End the day with glögg and pepparkakor (gingersnaps) in a candlelit café.",
      transport: "All walkable, with trams for tired legs.",
      winter: "Liseberg opens for the Christmas season from mid-November. Check exact dates.",
      summer: "Take the Paddan sightseeing boat through the canals."
    },
    {
      day: 10, region: "West Coast", title: "Car-free islands",
      sw: "Södra skärgården",
      summary: "Tram to the sea, then a ferry to the southern archipelago. Smooth granite, wooden boathouses, salty air.",
      stops: [
        { t: "09:30", name: "Tram 11 to Saltholmen", place: "saltholmen", blurb: "Your Västtrafik city ticket covers both the tram and the ferry." },
        { t: "10:30", name: "Ferry to Styrsö", place: "styrso", blurb: "Hike the island's coastal paths and rock slabs." },
        { t: "13:00", name: "Lunch on the island", blurb: "Small harbour cafés. Some close off-season, so bring a packed lunch in winter." },
        { t: "14:30", name: "Vrångö", place: "vrango", blurb: "The southernmost island, with a nature reserve and sandy coves." },
        { t: "17:00", name: "Ferry back", blurb: "Watch for the last departure time." }
      ],
      fika: "Bring a thermos and cardamom buns",
      cozy: "Find a sheltered rock in the sun, out of the wind, and drink your coffee looking at the sea.",
      transport: "Tram 11 + ferry, all on one Västtrafik ticket.",
      winter: "Fewer ferries and closed cafés, but deeply peaceful. Dress in layers and windproof shoes.",
      summer: "Swim from the rocks. The water is cold and perfect."
    },
    {
      day: 11, region: "West Coast", title: "Marstrand fortress town",
      sw: "Marstrand",
      summary: "A pretty sailing town on a car-free island, crowned by a huge 17th-century fortress.",
      stops: [
        { t: "09:30", name: "Bus + ferry to Marstrand", place: "marstrand", blurb: "Express bus from Gothenburg, then a two-minute ferry across." },
        { t: "11:00", name: "Carlsten Fortress", place: "marstrand", blurb: "Walk the ramparts and tunnels. Big views over the Kattegat." },
        { t: "13:00", name: "Harbour lunch", blurb: "Fish soup, shrimp sandwich or a hot chocolate in a wood-panelled café." },
        { t: "14:30", name: "Walk round the island", blurb: "A path circles all of Marstrandsön in about an hour, over smooth pink granite." },
        { t: "Evening", name: "Back to Gothenburg", blurb: "Last bus back. Read the timetable on arrival." }
      ],
      fika: "A harbour café on Marstrand",
      cozy: "Watch the boats in the harbour with your hands round a warm mug.",
      transport: "Västtrafik express bus + short ferry.",
      winter: "The fortress has limited opening off-season. The island walk is always open.",
      summer: "With a car, head further north to Smögen's boardwalk and Fjällbacka instead."
    },
    {
      day: 12, region: "Gothenburg", title: "Slow goodbye",
      sw: "Hej då",
      summary: "No rush. Pick up souvenirs, one last fika, and a final walk by the canals.",
      stops: [
        { t: "09:30", name: "Saluhallen market hall", place: "saluhallen", blurb: "Cheeses, cured fish, cloudberry jam and crispbread to take home." },
        { t: "11:00", name: "Design & craft shopping", blurb: "Look for wooden butter knives, linen, dala horses and Swedish glass." },
        { t: "12:30", name: "Last fika", blurb: "Return to your favourite café of the trip." },
        { t: "Afternoon", name: "To the airport", blurb: "Flygbussarna airport buses go to Landvetter from the city centre." }
      ],
      fika: "Your favourite of the trip",
      cozy: "Write tonight's journal entry on the bus: three things you want to remember.",
      transport: "Flygbussarna to Landvetter Airport.",
      winter: "Take a box of pepparkakor for the trip home.",
      summer: "Pick up a jar of lingonberry jam to bring a little Sweden home."
    }
  ],

  extensions: [
    { id: "lapland", name: "Lapland add-on (4 days)", blurb: "Night train from Stockholm to Abisko or Kiruna. Icehotel in Jukkasjärvi, dog sledding, the Aurora Sky Station in Abisko. Best September to March for northern lights.", places: ["icehotel", "abisko", "aurorasky", "kiruna"] },
    { id: "gotland", name: "Gotland add-on (3 days)", blurb: "Ferry to Visby, a walled medieval town. Rose-covered cottages in summer, Fårö's sea stacks, saffron pancakes.", places: ["visby", "faro"] },
    { id: "skane", name: "Skåne add-on (3 days)", blurb: "Southern Sweden: Ystad's half-timbered houses, Ales Stenar stone ship on the cliffs, apple orchards of Österlen.", places: ["ystad", "alesstenar", "kivik", "malmo"] },
    { id: "smaland", name: "Småland add-on (2 days)", blurb: "Glassblowing in Glasriket, the Kingdom of Crystal, and Astrid Lindgren's World in Vimmerby.", places: ["kosta", "astrid", "kalmar"] }
  ],

  regions: ["Stockholm", "Archipelago", "Uppsala", "Dalarna", "Gothenburg", "West Coast", "Lapland", "Gotland", "Skåne", "Småland", "North"],
  categories: ["Sight", "Museum", "Fika", "Nature", "Village", "Experience"],

  places: [
    // Stockholm
    { id: "stortorget", name: "Stortorget", region: "Stockholm", cat: "Sight", lat: 59.3251, lon: 18.0711, blurb: "The oldest square in Stockholm, lined with gabled merchant houses.", tip: "Christmas market in Advent." },
    { id: "kaffekoppen", name: "Kaffekoppen", region: "Stockholm", cat: "Fika", lat: 59.3250, lon: 18.0706, blurb: "Candlelit cellar café on Stortorget.", tip: "Go downstairs to the vaults." },
    { id: "palace", name: "Royal Palace", region: "Stockholm", cat: "Sight", lat: 59.3268, lon: 18.0717, blurb: "Over 600 rooms. The Royal Armoury in the basement is free.", tip: "Changing of the guard around midday." },
    { id: "riddarholmen", name: "Riddarholmen quay", region: "Stockholm", cat: "Sight", lat: 59.3247, lon: 18.0632, blurb: "Quiet island quay with sunset views west over the water.", tip: "Best at dusk." },
    { id: "vasa", name: "Vasa Museum", region: "Stockholm", cat: "Museum", lat: 59.3280, lon: 18.0914, blurb: "A complete 1628 warship, raised from the harbour in 1961.", tip: "Go at opening time." },
    { id: "skansen", name: "Skansen", region: "Stockholm", cat: "Museum", lat: 59.3263, lon: 18.1037, blurb: "Open-air museum of historic Swedish buildings and Nordic animals.", tip: "Advent weekend Christmas market." },
    { id: "rosendal", name: "Rosendals Trädgård", region: "Stockholm", cat: "Fika", lat: 59.3266, lon: 18.1258, blurb: "Biodynamic garden with a greenhouse café and bakery.", tip: "Shorter hours in winter." },
    { id: "nordiska", name: "Nordiska museet", region: "Stockholm", cat: "Museum", lat: 59.3292, lon: 18.0938, blurb: "Swedish everyday life and traditions in a palace-like hall.", tip: "Great rainy-day museum." },
    { id: "monteliusvagen", name: "Monteliusvägen", region: "Stockholm", cat: "Sight", lat: 59.3200, lon: 18.0634, blurb: "Cliff-top path with a classic view of Gamla Stan.", tip: "Free, open all hours." },
    { id: "fotografiska", name: "Fotografiska", region: "Stockholm", cat: "Museum", lat: 59.3178, lon: 18.0857, blurb: "World-class photography exhibitions and a top-floor café with water views.", tip: "Open late most evenings." },
    { id: "vetekatten", name: "Vete-Katten", region: "Stockholm", cat: "Fika", lat: 59.3354, lon: 18.0638, blurb: "A traditional konditori since 1928.", tip: "Try the prinsesstårta." },
    { id: "saturnus", name: "Café Saturnus", region: "Stockholm", cat: "Fika", lat: 59.3401, lon: 18.0748, blurb: "Parisian-style café famous for enormous cinnamon buns.", tip: "Share one." },
    { id: "kungstradgarden", name: "Metro art (blue line)", region: "Stockholm", cat: "Experience", lat: 59.3307, lon: 18.0718, blurb: "Painted cave stations: Kungsträdgården, T-Centralen, Solna Centrum.", tip: "One ticket, a whole gallery." },
    { id: "stadshuset", name: "Stockholm City Hall", region: "Stockholm", cat: "Sight", lat: 59.3275, lon: 18.0543, blurb: "Home of the Nobel banquet, with the gold mosaic Golden Hall.", tip: "Climb the tower for a view." },
    { id: "drottningholm", name: "Drottningholm Palace", region: "Stockholm", cat: "Sight", lat: 59.3217, lon: 17.8867, blurb: "The royal family's home and a UNESCO site, with a perfectly preserved 18th-century theatre.", tip: "Good winter alternative to the archipelago." },
    { id: "skinnarviksberget", name: "Skinnarviksberget", region: "Stockholm", cat: "Nature", lat: 59.3196, lon: 18.0560, blurb: "Bare rock hill in the city centre with sunset views.", tip: "Bring a picnic." },
    // Archipelago
    { id: "vaxholm", name: "Vaxholm", region: "Archipelago", cat: "Village", lat: 59.4024, lon: 18.3510, blurb: "Wooden-house harbour town and island fortress.", tip: "Bus 670 runs year-round." },
    { id: "fjaderholmarna", name: "Fjäderholmarna", region: "Archipelago", cat: "Village", lat: 59.3256, lon: 18.1650, blurb: "The nearest archipelago islands, 25 min by boat. Crafts and smokehouses.", tip: "Mostly summer season." },
    { id: "grinda", name: "Grinda", region: "Archipelago", cat: "Nature", lat: 59.4110, lon: 18.5620, blurb: "Forest island with swimming rocks and an old inn.", tip: "Summer is best." },
    { id: "sandhamn", name: "Sandhamn", region: "Archipelago", cat: "Village", lat: 59.2873, lon: 18.9125, blurb: "Sailing village on the outer edge of the archipelago.", tip: "Stay overnight in summer." },
    // Uppsala
    { id: "uppsaladom", name: "Uppsala Cathedral", region: "Uppsala", cat: "Sight", lat: 59.8582, lon: 17.6336, blurb: "The tallest church in the Nordics.", tip: "Free entry." },
    { id: "guntherska", name: "Güntherska", region: "Uppsala", cat: "Fika", lat: 59.8566, lon: 17.6378, blurb: "Old-fashioned konditori with velvet and chandeliers.", tip: "Lunch and cake." },
    { id: "linnaeus", name: "Linnaeus Garden", region: "Uppsala", cat: "Nature", lat: 59.8617, lon: 17.6339, blurb: "Carl Linnaeus's 18th-century botanical garden and home.", tip: "Garden is seasonal." },
    { id: "gamlauppsala", name: "Gamla Uppsala", region: "Uppsala", cat: "Sight", lat: 59.8977, lon: 17.6302, blurb: "Royal burial mounds from the 500s.", tip: "Golden hour." },
    { id: "sigtuna", name: "Sigtuna", region: "Uppsala", cat: "Village", lat: 59.6170, lon: 17.7230, blurb: "Sweden's oldest town: church ruins, rune stones, tiny main street.", tip: "Half-day trip." },
    // Dalarna
    { id: "falun", name: "Falun Copper Mine", region: "Dalarna", cat: "Museum", lat: 60.5994, lon: 15.6141, blurb: "UNESCO mine and source of Falu red paint.", tip: "Book the underground tour." },
    { id: "rattvik", name: "Långbryggan, Rättvik", region: "Dalarna", cat: "Nature", lat: 60.8840, lon: 15.1090, blurb: "A 628 m wooden pier out into Lake Siljan.", tip: "Sunset walk." },
    { id: "tallberg", name: "Tällberg", region: "Dalarna", cat: "Village", lat: 60.8240, lon: 15.0050, blurb: "Hillside village of timber farmhouses above Siljan.", tip: "Cozy inns." },
    { id: "nusnas", name: "Nusnäs", region: "Dalarna", cat: "Experience", lat: 60.9620, lon: 14.6440, blurb: "Village where Dala horses are carved and painted by hand.", tip: "Paint your own." },
    { id: "zorn", name: "Zorngården, Mora", region: "Dalarna", cat: "Museum", lat: 61.0050, lon: 14.5470, blurb: "Painter Anders Zorn's home and museum.", tip: "Guided tours only." },
    { id: "carllarsson", name: "Carl Larsson-gården", region: "Dalarna", cat: "Museum", lat: 60.6560, lon: 15.7810, blurb: "The artist's home in Sundborn, the origin of the Swedish cozy-home look.", tip: "The coziest house in Sweden." },
    // Gothenburg
    { id: "haga", name: "Haga", region: "Gothenburg", cat: "Village", lat: 57.6985, lon: 11.9560, blurb: "Historic café street of wooden and stone houses.", tip: "Christmas market in Advent." },
    { id: "husaren", name: "Café Husaren", region: "Gothenburg", cat: "Fika", lat: 57.6987, lon: 11.9548, blurb: "Home of the giant Hagabullen cinnamon bun.", tip: "Arrive early." },
    { id: "skansenkronan", name: "Skansen Kronan", region: "Gothenburg", cat: "Sight", lat: 57.6955, lon: 11.9530, blurb: "Hilltop fortress above Haga.", tip: "Free view." },
    { id: "feskekorka", name: "Feskekôrka", region: "Gothenburg", cat: "Sight", lat: 57.7010, lon: 11.9590, blurb: "Fish market in a church-shaped hall.", tip: "Fish soup lunch." },
    { id: "saluhallen", name: "Saluhallen", region: "Gothenburg", cat: "Experience", lat: 57.7050, lon: 11.9660, blurb: "19th-century market hall full of food stalls.", tip: "Edible souvenirs." },
    { id: "rohsska", name: "Röhsska Museum", region: "Gothenburg", cat: "Museum", lat: 57.6990, lon: 11.9730, blurb: "Design, fashion and craft museum.", tip: "Rainy-day pick." },
    { id: "slottsskogen", name: "Slottsskogen", region: "Gothenburg", cat: "Nature", lat: 57.6860, lon: 11.9420, blurb: "Huge city park with free animal enclosures.", tip: "Seals at feeding time." },
    { id: "liseberg", name: "Liseberg", region: "Gothenburg", cat: "Experience", lat: 57.6950, lon: 11.9920, blurb: "Amusement park, and a lantern-lit Christmas market in winter.", tip: "Check season dates." },
    // West Coast
    { id: "saltholmen", name: "Saltholmen", region: "West Coast", cat: "Nature", lat: 57.6590, lon: 11.8410, blurb: "Ferry terminal and bathing rocks at the end of tram 11.", tip: "Gateway to the islands." },
    { id: "styrso", name: "Styrsö", region: "West Coast", cat: "Nature", lat: 57.6150, lon: 11.7850, blurb: "Car-free island with coastal walking paths.", tip: "City ticket works." },
    { id: "vrango", name: "Vrångö", region: "West Coast", cat: "Nature", lat: 57.5700, lon: 11.7800, blurb: "Southernmost island with a nature reserve and sandy coves.", tip: "Pack a lunch." },
    { id: "marstrand", name: "Marstrand", region: "West Coast", cat: "Village", lat: 57.8870, lon: 11.5840, blurb: "Car-free sailing town with Carlsten Fortress.", tip: "Walk round the island." },
    { id: "smogen", name: "Smögen", region: "West Coast", cat: "Village", lat: 58.3540, lon: 11.2180, blurb: "Colourful boathouses along a long harbour boardwalk.", tip: "Shrimp from the boats." },
    { id: "fjallbacka", name: "Fjällbacka", region: "West Coast", cat: "Village", lat: 58.5990, lon: 11.2860, blurb: "Fishing village under a granite cliff. Climb the Kungsklyftan ravine.", tip: "Best by car." },
    // Lapland
    { id: "icehotel", name: "Icehotel, Jukkasjärvi", region: "Lapland", cat: "Experience", lat: 67.8490, lon: 20.5940, blurb: "A hotel rebuilt from river ice every winter by artists.", tip: "Day visits possible." },
    { id: "kiruna", name: "Kiruna", region: "Lapland", cat: "Village", lat: 67.8558, lon: 20.2253, blurb: "Arctic mining town being moved east block by block.", tip: "Base for dog sledding." },
    { id: "abisko", name: "Abisko National Park", region: "Lapland", cat: "Nature", lat: 68.3490, lon: 18.8300, blurb: "Mountain valley famous for clear skies and northern lights.", tip: "Night train stops here." },
    { id: "aurorasky", name: "Aurora Sky Station", region: "Lapland", cat: "Experience", lat: 68.3570, lon: 18.7800, blurb: "Chairlift up Mt Nuolja to an aurora viewing station.", tip: "Book ahead, dress very warm." },
    // Gotland
    { id: "visby", name: "Visby", region: "Gotland", cat: "Village", lat: 57.6390, lon: 18.2950, blurb: "Walled medieval town of church ruins and rose-covered cottages.", tip: "Summer is liveliest." },
    { id: "faro", name: "Fårö", region: "Gotland", cat: "Nature", lat: 57.9200, lon: 19.1300, blurb: "Windswept island of limestone sea stacks (raukar).", tip: "Free car ferry." },
    // Skåne
    { id: "ystad", name: "Ystad", region: "Skåne", cat: "Village", lat: 55.4295, lon: 13.8200, blurb: "Half-timbered houses and cobbled streets on the south coast.", tip: "Base for Österlen." },
    { id: "alesstenar", name: "Ales Stenar", region: "Skåne", cat: "Sight", lat: 55.3830, lon: 14.0540, blurb: "A 67 m stone ship on a sea cliff.", tip: "Sunset." },
    { id: "kivik", name: "Kivik, Österlen", region: "Skåne", cat: "Village", lat: 55.6800, lon: 14.2300, blurb: "Apple-orchard country with farm cafés.", tip: "Autumn apple season." },
    { id: "malmo", name: "Malmö Lilla Torg", region: "Skåne", cat: "Sight", lat: 55.6050, lon: 12.9990, blurb: "Cosy cobbled square of old half-timbered buildings.", tip: "Evening drinks." },
    // Småland
    { id: "kosta", name: "Kosta glassworks", region: "Småland", cat: "Experience", lat: 56.8440, lon: 15.3960, blurb: "Watch glassblowers in the Kingdom of Crystal.", tip: "Hyttsill evenings." },
    { id: "astrid", name: "Astrid Lindgren's World", region: "Småland", cat: "Experience", lat: 57.6610, lon: 15.8530, blurb: "Theme park of Astrid Lindgren's stories in Vimmerby.", tip: "Summer season." },
    { id: "kalmar", name: "Kalmar Castle", region: "Småland", cat: "Sight", lat: 56.6580, lon: 16.3570, blurb: "Renaissance castle by the sea.", tip: "Walk the old town too." },
    // North
    { id: "are", name: "Åre", region: "North", cat: "Village", lat: 63.3990, lon: 13.0810, blurb: "Sweden's mountain village: skiing in winter, hiking in summer.", tip: "Ride the cable car." },
    { id: "hogakusten", name: "High Coast (Skuleberget)", region: "North", cat: "Nature", lat: 63.0900, lon: 18.3800, blurb: "UNESCO coastline still rising from the sea after the Ice Age.", tip: "Hike or take the lift up." }
  ],

  fika: [
    { name: "Kanelbulle", sw: "kah-NEHL-bul-leh", note: "Cinnamon bun, twisted and topped with pearl sugar. It has its own day: 4 October." },
    { name: "Kardemummabulle", sw: "kar-deh-MUM-ah-bul-leh", note: "Cardamom bun. Many Swedes secretly prefer it." },
    { name: "Prinsesstårta", sw: "prin-SESS-tor-ta", note: "Green marzipan dome over cream, custard and sponge." },
    { name: "Kladdkaka", sw: "KLAD-kah-ka", note: "Sticky, gooey chocolate cake, served with whipped cream." },
    { name: "Chokladboll", sw: "shock-LAHD-boll", note: "No-bake oat and cocoa ball rolled in coconut." },
    { name: "Lussekatt", sw: "LUSS-eh-kat", note: "Saffron bun with raisins, around Lucia (13 December)." },
    { name: "Semla", sw: "SEM-la", note: "Cardamom bun with almond paste and cream, from early in the year until Easter." },
    { name: "Pepparkakor", sw: "PEP-par-kah-kor", note: "Thin spiced gingersnaps, best with glögg in December." }
  ],

  words: [
    { w: "Fika", d: "A coffee break with something sweet, and with people. A ritual, not just a snack." },
    { w: "Mys / mysig", d: "Cosiness / cosy. Candles, blankets, good company." },
    { w: "Lagom", d: "Not too much, not too little. Just right." },
    { w: "Allemansrätten", d: "The right to roam: you may walk, camp a night and pick berries on most land, if you leave no trace." },
    { w: "Mångata", d: "The road-like reflection of the moon on water." },
    { w: "Gökotta", d: "Getting up early to go outside and hear the first birds." },
    { w: "Fredagsmys", d: "Cosy Friday: tacos, crisps and a film on the sofa." },
    { w: "Myspys", d: "Extra-cosy, playful version of mys." }
  ],

  traditions: [
    { when: "Advent (Dec)", what: "Electric candle arches and paper stars glow in nearly every window. Glögg and pepparkakor everywhere." },
    { when: "13 December", what: "Lucia: processions in white gowns with candles, singing in the dark morning. Saffron buns." },
    { when: "Christmas Eve", what: "The main celebration. Julbord buffet, and Donald Duck on TV at 3 pm." },
    { when: "Spring", what: "Semla season, then Valborg (30 April) bonfires to welcome spring." },
    { when: "Midsummer", what: "Maypoles, flower crowns, pickled herring, new potatoes and strawberries." },
    { when: "August", what: "Kräftskiva: crayfish parties with paper lanterns and drinking songs." },
    { when: "4 October", what: "Kanelbullens dag, cinnamon bun day." }
  ],

  phrases: [
    { sv: "Hej!", say: "hey", en: "Hello" },
    { sv: "Tack (så mycket)", say: "tack (so MEW-keh)", en: "Thanks (very much)" },
    { sv: "Ursäkta", say: "OOR-shek-ta", en: "Excuse me" },
    { sv: "En kaffe och en kanelbulle, tack", say: "en KAF-feh ock en ka-NEHL-bul-leh, tack", en: "A coffee and a cinnamon bun, please" },
    { sv: "Var är toaletten?", say: "var air too-a-LET-en", en: "Where's the toilet?" },
    { sv: "Kan jag betala med kort?", say: "kan yah beh-TAH-la med kort", en: "Can I pay by card?" },
    { sv: "Det var gott!", say: "deh var gott", en: "That was delicious!" },
    { sv: "Skål!", say: "skohl", en: "Cheers!" },
    { sv: "Hej då!", say: "hey doh", en: "Goodbye!" },
    { sv: "Jag förstår inte", say: "yah fur-STOR in-teh", en: "I don't understand" }
  ],

  practical: [
    { h: "Payments", d: "Sweden is almost cashless. Cards and phone wallets work nearly everywhere; some places take no cash at all." },
    { h: "Emergency", d: "Call 112 for police, fire and ambulance. 1177 is the healthcare advice line." },
    { h: "Alcohol", d: "Wine, spirits and strong beer are sold only at Systembolaget shops, which keep short hours and close Sundays." },
    { h: "Public transport", d: "Tap a contactless card in Stockholm (SL). In Gothenburg use the Västtrafik app or ticket machines. Long-distance trains: SJ and others; book early for lower prices." },
    { h: "Daylight", d: "Very short days in late autumn and winter, and near-endless light around midsummer. In the far north the sun doesn't rise at all for weeks around Christmas." },
    { h: "Right to roam", d: "Allemansrätten lets you walk most land freely. Don't disturb, don't destroy: no fires in dry weather, no camping near houses." },
    { h: "Water", d: "Tap water is excellent everywhere. Bring a bottle." },
    { h: "Offline maps", d: "Before the trip, download Sweden in Apple Maps (Settings in Maps → Offline Maps) so the 'Open in Maps' buttons work without internet." }
  ],

  packing: [
    "Passport / ID", "Bank card + backup card", "Phone charger & adapter (type F)", "Warm wool layers",
    "Waterproof jacket", "Comfortable walking shoes", "Wool socks", "Hat, scarf & gloves",
    "Reusable water bottle", "Thermos for fika", "Small torch / headlamp", "Swimwear (sauna!)",
    "Book for train rides", "Offline Apple Maps downloaded"
  ]
};
