const fetch = require("node-fetch");
const { URLSearchParams } = require("url");
const cheerio = require("cheerio");
const tableParser = require("cheerio-tableparser");
const dotenv = require("dotenv").config();

const getCookie = () =>
  new Promise((resolve, reject) => {
    fetch("https://sipresmawa.umsida.ac.id/mobile/login1.php", {
      method: "GET"
    })
      .then(res => {
        const cook = res.headers.raw();
        const finalCook = cook["set-cookie"][0].split(";")[0];
        resolve(finalCook);
      })
      .catch(err => reject(err));
  });

const login = session =>
  new Promise((resolve, reject) => {
    const params = new URLSearchParams();
    params.append("username", process.env.USERNAME);
    params.append("password", process.env.PASS);
    params.append("login", "");

    fetch("https://sipresmawa.umsida.ac.id/mobile/login1.php", {
      method: "POST",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:72.0) Gecko/20100101 Firefox/72.0",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Content-Type": "application/x-www-form-urlencoded",
        Origin: "https://sipresmawa.umsida.ac.id",
        Connection: "keep-alive",
        Referer: "https://sipresmawa.umsida.ac.id/mobile/login1.php",
        "Upgrade-Insecure-Requests": "1",
        Cookie: `${session}; _ga=GA1.1.2001097099.1581146924; _ga_45PE5DL6KW=GS1.1.1581161539.3.0.1581161539.0`
      },
      body: params
    })
      .then(res => res.text())
      .then(resp => resolve(resp))
      .catch(err => reject(err));
  });

const info = session =>
  new Promise((resolve, reject) => {
    fetch("https://sipresmawa.umsida.ac.id/mobile/profil.php", {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:72.0) Gecko/20100101 Firefox/72.0",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Content-Type": "application/x-www-form-urlencoded",
        Origin: "https://sipresmawa.umsida.ac.id",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        Cookie: `${session}; _ga=GA1.1.2001097099.1581146924; _ga_45PE5DL6KW=GS1.1.1581161539.3.0.1581161539.0`
      }
    })
      .then(res => res.text())
      .then(resp => {
        const $ = cheerio.load(resp);
        const dat = $("div#Profile")
          .children("span")
          .html()
          .split("<br>");
        const data = {
          nama: dat[0],
          nim: dat[1],
          prodi: dat[2]
        };
        resolve(data);
      })
      .catch(err => reject(err));
  });

const logAct = session =>
  new Promise((resolve, reject) => {
    fetch("https://sipresmawa.umsida.ac.id/mobile/riwayat.php", {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:72.0) Gecko/20100101 Firefox/72.0",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        Cookie: ` _ga=GA1.1.2001097099.1581146924; _ga_45PE5DL6KW=GS1.1.1581161539.3.0.1581161539.0; ${session}`
      }
    })
      .then(res => res.text())
      .then(async resp => {
        const $ = await cheerio.load(resp);
        tableParser($);

        //fun valid
        const validPoint = () => {
          const page = $("div.box:nth-child(1) > div:nth-child(2)").parsetable(
            false,
            false,
            true
          );
          let data = [];
          const jumlah = page[0].length - 1;
          for (let i = 1; i < jumlah; i++) {
            let items = {
              kegiatan: page[1][i].split("\n")[1].trim(),
              point: page[3][i],
              total: page[3][jumlah]
            };
            data.push(items);
          }
          return data;
        };

        //fun not valid
        const notValidPoint = () => {
          const page = $("div.box:nth-child(2) > div:nth-child(2)").parsetable(
            false,
            false,
            true
          );
          let data = [];
          const jumlah = page[0].length - 1;
          for (let i = 1; i < jumlah; i++) {
            let items = {
              kegiatan: page[1][i].split("\n")[1].trim(),
              point: page[3][i],
              total: page[3][jumlah]
            };
            data.push(items);
          }
          return data;
        };

        const valid = await validPoint();
        const notvalid = await notValidPoint();

        resolve({
          valid,
          notvalid
        });
      })
      .catch(err => reject(err));
  });

const daftarKegiatan = session =>
  new Promise((resolve, reject) => {
    fetch("https://sipresmawa.umsida.ac.id/mobile/daftar_kegiatan.php", {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:72.0) Gecko/20100101 Firefox/72.0",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        Cookie: ` _ga=GA1.1.2001097099.1581146924; _ga_45PE5DL6KW=GS1.1.1581161539.3.0.1581161539.0; ${session}`
      }
    })
      .then(res => res.text())
      .then(async resp => {
        const $ = cheerio.load(resp);
        tableParser($);
        const dat = $("table.table").parsetable(false, false, false);

        //group semua endpoint link
        const param = () => {
          const lik = dat[0];
          const p = [];
          let i = 3;
          while (i < lik.length) {
            const raw = lik[i].split(/"(.*?)"/)[1].replace("amp;", "");
            p.push(raw);
            i += 4;
          }
          return p;
        };

        //group semua data harga
        const harga = () => {
          const dats = dat[1];
          const har = [];
          let i = 0;
          while (i < dats.length) {
            const hars = dats[i];
            har.push(hars);
            i += 4;
          }
          return har;
        };

        //group semua kuota
        const kuota = () => {
          const kuo = dat[1];
          const kuotas = [];
          let i = 1;
          while (i < kuo.length) {
            const k = $(kuo[i])
              .text()
              .trim()
              .replace(" Kuota", "");
            kuotas.push(k);
            i += 4;
          }
          return kuotas;
        };

        //Racik euy
        const l = await param();
        const h = await harga();
        const k = await kuota();

        const final = [];
        for (let i = 0; i < l.length; i++) {
          const obj = {
            link: l[i],
            harga: h[i],
            kuota: k[i]
          };
          final.push(obj);
        }

        resolve(final);
      })
      .catch(err => reject(err));
  });

const detailkegiatan = (param, session) =>
  new Promise((resolve, reject) => {
    fetch(`https://sipresmawa.umsida.ac.id/mobile/${param}`, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:72.0) Gecko/20100101 Firefox/72.0",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        Cookie: ` _ga=GA1.1.2001097099.1581146924; _ga_45PE5DL6KW=GS1.1.1581161539.3.0.1581161539.0; ${session}`
      }
    })
      .then(res => res.text())
      .then(resp => {
        const $ = cheerio.load(resp);
        const nama = $(
          ".box-header > h3:nth-child(2) > center:nth-child(1)"
        ).text();
        const penyelenggara = $(
          ".box-header > center:nth-child(3) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(3) > font:nth-child(1)"
        ).text();
        const lokasi = $(
          ".box-header > center:nth-child(3) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(3) > font:nth-child(1)"
        ).text();
        const tanggal = $(
          ".box-header > center:nth-child(3) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(4) > td:nth-child(3) > font:nth-child(1)"
        ).text();
        const jam = $(
          ".box-header > center:nth-child(3) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(5) > td:nth-child(3) > font:nth-child(1)"
        ).text();
        const point = $(
          ".box-header > center:nth-child(3) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(6) > td:nth-child(3) > font:nth-child(1)"
        ).text();

        resolve({
          nama,
          penyelenggara,
          lokasi,
          tanggal,
          jam,
          point
        });
      })
      .catch(err => reject(err));
  });

const finalData = async session => {
  const a = await daftarKegiatan(session);
  const arr = [];
  for (let i = 0; i < a.length; i++) {
    const aas = await detailkegiatan(a[i].link, session);
    const obk = {
      nama: aas.nama,
      penyelenggara: aas.penyelenggara,
      lokasi: aas.lokasi,
      tanggal: aas.tanggal,
      jam: aas.jam,
      point: aas.point,
      harga: a[i].harga,
      kuota: a[i].kuota
    };
    arr.push(obk);
  }
  return arr;
};

//====================================================================

module.exports = {
  getCookie,
  login,
  info,
  logAct,
  finalData
};
