Kirjoitin testit yoprep, joka on yo harjoittelualusta. 
Testasin mitä tapahtuu, kun sovellus käynnistyy ilman seed dataa eli ilman 
että se automaattisesti insertoi testidatan databaseen, koska käytän H2 databasea
vielä kehitysvaiheen ajan, joka automaattisesti nollaantuu kun ohjelma ajetaan uudestaan.

Testi epäonnistui nullptrexceptiolla, mikä tarkoitti sitä että API antaa 500 Internal server Errorin
mikä ei ole ideaali, koska se näyttää siltä että sovellus on kaatunut.

Lisäsin null-tarkistuksen ja nyt API palautttaa oikean 404 virheen.


