const sipres = require("./sipres");
const readline = require("readline-sync");

(async () => {
  try {
    //init
    const gc = await sipres.getCookie();
    const log = await sipres.login(gc);

    //Info
    const inf = await sipres.info(gc);
    console.log(inf);
    const pilihan = ["History Kegiatan", "Daftar Kegiatan"];
    const index = await readline.keyInSelect(pilihan, "Silahkan Pilih Menu! ");

    if (pilihan[index] == "History Kegiatan") {
      const act = await sipres.logAct(gc);
      console.log(act);
    } else if (pilihan[index] == "Daftar Kegiatan") {
      const dat = await sipres.finalData(gc);
      console.log(dat);
    }
  } catch (error) {
    console.log(error);
  }
})();
