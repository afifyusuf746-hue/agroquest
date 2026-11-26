var fs=class{constructor(){let e;try{e=JSON.parse(localStorage.getItem("agroquest-audio")||"null")}catch{}this.settings={music:!0,effects:!0,musicVolume:.22,effectsVolume:.35,...e},this.beat=0,this.nodes=new Set,this.onChange=null,document.addEventListener("visibilitychange",()=>{document.hidden?this.pause():this.context&&this.unlock()}),document.addEventListener("pointerdown",()=>this.unlock(),{passive:!0}),document.addEventListener("keydown",()=>this.unlock(),{passive:!0})}async unlock(){if(!document.hidden)try{if(!this.context){let e=window.AudioContext||window.webkitAudioContext;if(!e)return;this.context=new e,this.musicGain=this.context.createGain(),this.fxGain=this.context.createGain(),this.musicGain.connect(this.context.destination),this.fxGain.connect(this.context.destination),this.applyVolumes()}this.context.state==="suspended"&&await this.context.resume(),!this.timer&&this.settings.music&&(this.nextNote=this.context.currentTime+.08,this.timer=setInterval(()=>this.schedule(),120),this.schedule()),this.onChange?.()}catch{this.onChange?.()}}applyVolumes(){this.context&&(this.musicGain.gain.setTargetAtTime(this.settings.music?this.settings.musicVolume*.3:0,this.context.currentTime,.04),this.fxGain.gain.setTargetAtTime(this.settings.effects?this.settings.effectsVolume*.3:0,this.context.currentTime,.04))}update(e){Object.assign(this.settings,e);for(let n of["musicVolume","effectsVolume"])this.settings[n]=Math.max(0,Math.min(1,Number(this.settings[n])||0));try{localStorage.setItem("agroquest-audio",JSON.stringify(this.settings))}catch{}this.applyVolumes(),this.settings.music?this.unlock():(clearInterval(this.timer),this.timer=null),this.onChange?.()}pause(){clearInterval(this.timer),this.timer=null,this.context?.suspend().catch(()=>{})}tone(e,n,i,s=.2,r="sine",o=!1){if(!this.context)return;let l=this.context.createOscillator(),u=this.context.createGain();l.type=r,l.frequency.setValueAtTime(440*Math.pow(2,(e-69)/12),n),u.gain.setValueAtTime(1e-4,n),u.gain.exponentialRampToValueAtTime(Math.max(2e-4,s),n+.015),u.gain.exponentialRampToValueAtTime(1e-4,n+i),l.connect(u),u.connect(o?this.fxGain:this.musicGain),l.start(n),l.stop(n+i+.03),this.nodes.add(l),l.onended=()=>{l.disconnect(),u.disconnect(),this.nodes.delete(l)}}schedule(){if(!this.context||this.context.state!=="running"||!this.settings.music)return;let e=[72,null,76,79,76,null,74,72,69,null,72,76,74,null,72,null,67,null,71,74,76,null,74,71,69,null,72,74,72,null,67,null],n=[[48,55,60],[45,52,57],[41,48,53],[43,50,55]],i=this.context.currentTime;for(this.nextNote<i&&(this.nextNote=i+.03);this.nextNote<i+.45;){let s=this.beat%32,r=e[s];if(r!==null&&this.tone(r,this.nextNote,1.1,.19,"sine"),s%8===0)for(let o of n[Math.floor(s/8)])this.tone(o,this.nextNote,3.3,.075,"sine");s%4===2&&this.tone(60+(s%8?7:4),this.nextNote,1.25,.06,"triangle"),this.nextNote+=.38,this.beat++}}fx(e="click"){if(!this.settings.effects||!this.context||this.context.state!=="running")return;let n=this.context.currentTime;e==="success"?[72,76,79,84].forEach((i,s)=>this.tone(i,n+s*.09,.35,.27,"sine",!0)):e==="jump"?(this.tone(67,n,.12,.2,"sine",!0),this.tone(76,n+.065,.17,.17,"sine",!0)):e==="water"?[79,74,72].forEach((i,s)=>this.tone(i,n+s*.055,.18,.14,"sine",!0)):this.tone(76,n,.095,.12,"sine",!0)}status(){return this.settings.music?this.context?.state==="running"?"Musik latar menyala":"Ketuk layar untuk memulai musik":"Musik dimatikan"}};function lc({state:a,getSession:e,rememberRoom:n,restore:i,renderHUD:s}){let r=!1,o=0,l=null,u=null,c=0,h=()=>document.getElementById("cloudstatus");function f(T,_=!1){let x=h();x&&(x.textContent=T,x.classList.toggle("cloud-error",_))}function p(){return{learning:a.learning||{},completed:a.completed||[],xp:a.completed.length*100+a.farmXP+(a.flags.obby?100:0),coins:a.completed.length*50+a.bank+(a.flags.obby?50:0),harvested:a.harvested||0}}function g(){r=!0,o++,clearTimeout(l),e()?.learnerId?(f("\u2601 Menunggu penyimpanan\u2026"),l=setTimeout(()=>y().catch(()=>{}),1800)):f("\u2601 Masuk kelas untuk menyimpan ke guru")}async function y(){if(clearTimeout(l),u)return u;let T=e();if(!T?.learnerId){f("\u2601 Masuk kelas untuk menyimpan ke guru");return}if(!r)return;let _=o,x=new AbortController,A=setTimeout(()=>x.abort(),1e4);return f("\u2601 Menyimpan progres\u2026"),u=(async()=>{try{let E=await fetch("/api/rooms/progress",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+T.token},body:JSON.stringify({room:T.room,revision:T.revision||0,progress:p()}),signal:x.signal}),C=await E.json();if(!E.ok){let P=Error(C.error||"Penyimpanan gagal.");throw P.status=E.status,P}if(e()!==T)return;T.revision=C.revision,n(),c=C.savedAt,_===o&&(r=!1),f("\u2601 Tersimpan untuk guru \xB7 "+new Date(c).toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"}))}catch(E){throw f(E.status===409?"\u26A0 Konflik sesi \xB7 masuk ulang kelas":"\u26A0 Belum tersimpan \xB7 ketuk untuk mencoba",!0),E}finally{clearTimeout(A),u=null,r&&_!==o&&e()&&(l=setTimeout(()=>y().catch(()=>{}),2e3))}})(),u}function v(T){if(T.learnerToken)try{localStorage.setItem("agroquest-learner",T.learnerToken)}catch{}T.priorProgress&&i(T.priorProgress),s(),g()}function m(){clearTimeout(l),r=!1,f("\u2601 Masuk kelas untuk menyimpan ke guru")}let d=setInterval(()=>{e()?.learnerId&&document.visibilityState==="visible"&&g()},3e4);return h()&&(h().onclick=()=>{r=!0,y().catch(()=>{})}),f(e()?"\u2601 Menghubungkan penyimpanan\u2026":"\u2601 Masuk kelas untuk menyimpan ke guru"),e()?.learnerId&&g(),{mark:g,flush:y,joined:v,left:m,status:f,snapshot:p}}var tn={label:"Buku Dasar-Dasar Budidaya Tanaman \u2014 Kemendikdasmen",url:"https://repositori.kemendikdasmen.go.id/8842/1/Dasar-Budidaya-Tanaman-1.pdf"},Th={label:"Integrated Pest Management \u2014 FAO",url:"https://www.fao.org/pest-and-pesticide-management/ipm/integrated-pest-management/en"},Ao={label:"Crop Water Needs \u2014 FAO",url:"https://www.fao.org/4/s2022e/s2022e07.htm"},cc={label:"Plant Nutrition for Food Security: Hydroponics \u2014 FAO",url:"https://www.fao.org/docrep/pdf/009/a0443e/a0443e03.pdf"},Xe=(a,e,n,i)=>({text:a,options:e,answer:n,explanation:i}),Ai=[{id:"k3",title:"K3LH dan alat pertanian",emoji:"\u{1F97E}",category:"Dasar",zone:"Alun-alun",level:"X",minutes:8,summary:"Kenali risiko, pilih APD, dan siapkan alat sebelum bekerja.",terms:["APD","bahaya","risiko","SOP"],objectives:["Membedakan bahaya dan risiko di kebun.","Memilih APD sesuai pekerjaan.","Memeriksa serta menyimpan alat dengan aman."],sections:[{title:"Keselamatan dimulai sebelum praktik",paragraphs:["Bahaya adalah sumber yang berpotensi menimbulkan cedera, seperti mata cangkul tajam, lantai licin, atau kabel rusak. Risiko berkaitan dengan kemungkinan dan dampak cedera saat seseorang terpapar bahaya tersebut. Mengidentifikasi bahaya membantu kita memilih tindakan pencegahan sebelum bekerja.","K3LH mencakup keselamatan, kesehatan kerja, dan lingkungan hidup. APD adalah perlindungan tambahan, bukan pengganti alat yang layak dan cara kerja yang benar. Sepatu tertutup atau bot membantu melindungi kaki; sarung tangan disesuaikan dengan kegiatan, dan pelindung kepala membantu saat bekerja di bawah panas."]},{title:"Urutan menyiapkan pekerjaan",paragraphs:["Baca instruksi kerja dan periksa area. Singkirkan benda yang dapat menyebabkan tersandung, pastikan jalur aman, serta ketahui lokasi air bersih, kotak P3K, dan tempat melapor. Periksa gagang, sambungan, ketajaman, serta kebersihan alat. Pisahkan alat rusak untuk diperbaiki.","Gunakan alat sesuai fungsi dan jaga jarak aman dari teman. Saat selesai, bersihkan alat, keringkan, dan simpan dengan bagian tajam terlindung. Pisahkan sampah organik, sampah lain, dan bahan berbahaya sesuai prosedur sekolah. Cuci tangan sesudah menangani tanah, kompos, atau tanaman."]},{title:"Kasus: mengejar target pengolahan lahan",paragraphs:["Kelompokmu diminta menyelesaikan satu bedengan. Satu cangkul bergagang longgar, jalur kebun basah, dan dua siswa belum memakai sepatu. Mengejar target dengan tetap bekerja meningkatkan risiko cedera.","Hentikan pekerjaan sementara, laporkan alat rusak, tandai jalur licin, dan lengkapi perlindungan yang sesuai. Atur ulang pembagian tugas. Kecepatan kerja baru dinilai setelah kondisi aman; kelompok tetap dapat mempersiapkan bahan dan mencatat kebutuhan alat sambil menunggu perbaikan."]}],tasks:["Identifikasi tiga bahaya pada area praktik bersama guru.","Pasangkan setiap bahaya dengan tindakan pencegahan.","Periksa satu alat tanpa mengayunkannya ke arah teman.","Peragakan cara membawa dan menyimpan alat."],reflection:"Bahaya apa yang paling mudah terlewat di kebun sekolah, dan bagaimana kamu mencegahnya?",quiz:[Xe("Apa perbedaan bahaya dan risiko?",["Bahaya adalah sumber cedera; risiko berkaitan dengan kemungkinan dan dampaknya","Keduanya hanya berarti alat tajam","Risiko selalu hilang jika memakai sarung tangan"],0,"Alat tajam dapat menjadi bahaya; tingkat risiko bergantung pada paparan, cara penggunaan, dan pengendaliannya."),Xe("Gagang cangkul longgar. Apa tindakanmu?",["Tetap dipakai pelan-pelan","Hentikan penggunaan dan laporkan untuk diperbaiki","Berikan kepada teman yang lebih kuat"],1,"Alat harus layak sebelum digunakan. Memindahkan alat rusak kepada teman hanya memindahkan bahaya."),Xe("Setelah praktik, perlakuan alat yang tepat adalah\u2026",["Ditinggalkan dalam keadaan basah","Ditumpuk dengan mata tajam terbuka","Dibersihkan, dikeringkan, lalu disimpan dengan aman"],2,"Pembersihan dan penyimpanan yang tepat menjaga keselamatan serta memperpanjang umur alat.")],sources:[tn]},{id:"tumbuh",title:"Tanaman dan lingkungan tumbuh",emoji:"\u2600\uFE0F",category:"Dasar",zone:"Kebun praktik",level:"X",minutes:8,summary:"Hubungkan fungsi akar, daun, cahaya, air, dan suhu dengan pertumbuhan.",terms:["fotosintesis","respirasi","transpirasi","agroekologi"],objectives:["Menjelaskan fungsi organ utama tanaman.","Menghubungkan lingkungan dengan pertumbuhan.","Membuat pengamatan sederhana tanpa mengubah banyak faktor sekaligus."],sections:[{title:"Tanaman bekerja sebagai satu sistem",paragraphs:["Akar menambatkan tanaman dan menyerap air serta unsur hara. Batang menopang organ dan mengangkut bahan. Daun menjadi lokasi utama fotosintesis pada banyak tanaman. Bunga berperan dalam perkembangbiakan generatif, sedangkan buah dan biji berkaitan dengan kelanjutan siklus hidup.","Fotosintesis menggunakan energi cahaya untuk membentuk bahan organik dari air dan karbon dioksida. Respirasi melepaskan energi dari bahan organik untuk aktivitas sel dan berlangsung siang maupun malam. Transpirasi adalah kehilangan air terutama melalui daun; proses ini berkaitan dengan kebutuhan air tanaman."]},{title:"Membaca kebutuhan lingkungan",paragraphs:["Pertumbuhan dipengaruhi cahaya, suhu, air, udara, media, dan unsur hara. Setiap komoditas mempunyai kebutuhan berbeda. Naungan yang sesuai bagi bibit tertentu belum tentu tepat bagi tanaman dewasa. Kelebihan air juga dapat menghambat akar karena pori media kekurangan udara.","Amati satu komoditas pada dua kondisi cahaya yang direncanakan guru. Gunakan bibit, media, ukuran wadah, dan perlakuan lain yang sebanding. Catat tinggi, jumlah daun, warna, serta kondisi media pada waktu yang sama. Menyamakan faktor lain membantu menghubungkan hasil dengan perlakuan yang diuji."]},{title:"Kasus: bibit tinggi tetapi lemah",paragraphs:["Dua kelompok menyemai tanaman yang sama. Kelompok A meletakkan bibit di lokasi kurang cahaya; batangnya memanjang dan mudah rebah. Kelompok B memperoleh cahaya yang sesuai dan pertumbuhannya lebih kokoh. Tinggi tanaman saja belum cukup untuk menilai mutu bibit.","Periksa juga kekokohan batang, warna daun, akar, dan lingkungan. Usulkan penyesuaian cahaya secara bertahap sesuai kebutuhan komoditas. Hindari langsung memindahkan bibit yang lama ternaungi ke panas kuat tanpa adaptasi."]}],tasks:["Gambar satu tanaman dan beri label organ utamanya.","Catat kondisi cahaya, media, dan air di dua lokasi.","Bandingkan tinggi serta jumlah daun bibit yang sebanding.","Tulis satu kesimpulan beserta keterbatasan pengamatan."],reflection:"Mengapa tanaman paling tinggi belum tentu merupakan bibit paling sehat?",quiz:[Xe("Fungsi utama akar adalah\u2026",["Membentuk semua bunga","Menyerap air dan unsur hara serta menambatkan tanaman","Menggantikan seluruh fungsi daun"],1,"Akar menyerap air dan hara serta menambatkan tanaman. Organ lain tetap memiliki fungsi masing-masing."),Xe("Respirasi tanaman berlangsung\u2026",["Hanya saat malam","Hanya saat berbunga","Siang maupun malam"],2,"Tanaman membutuhkan energi untuk kegiatan sel sepanjang waktu."),Xe("Agar pengamatan pengaruh cahaya lebih adil, sebaiknya\u2026",["Gunakan komoditas, media, dan kondisi lain yang sebanding","Ubah cahaya, pupuk, dan air sekaligus","Bandingkan bibit berbeda umur tanpa mencatatnya"],0,"Menyamakan faktor lain membantu mengurangi penjelasan alternatif terhadap hasil pengamatan.")],sources:[tn,Ao]},{id:"media",title:"Media tanam dan pertanian organik",emoji:"\u{1FAB4}",category:"Budidaya",zone:"Laboratorium",level:"X\u2013XI",minutes:10,summary:"Rancang media yang menyediakan air, udara, dan penopang akar.",terms:["porositas","drainase","kompos matang","bahan organik"],objectives:["Menjelaskan fungsi media tanam.","Membedakan media yang terlalu padat dan terlalu cepat kering.","Memilih bahan organik matang serta menguji campuran sederhana."],sections:[{title:"Media adalah lingkungan hidup akar",paragraphs:["Media menopang tanaman, menyimpan air, menyediakan ruang udara, serta dapat menyumbang unsur hara. Porositas berkaitan dengan ruang pori; drainase adalah kemampuan mengalirkan kelebihan air. Keduanya perlu seimbang dengan kemampuan menyimpan kelembapan.","Bahan seperti tanah, kompos matang, sekam, pasir, atau sabut kelapa memiliki sifat berbeda. Tidak ada satu perbandingan campuran yang cocok untuk seluruh tanaman dan lokasi. Bahan organik matang dapat membantu struktur media, tetapi mutu, kebersihan, dan kebutuhan komoditas tetap harus diperhatikan."]},{title:"Menyiapkan dan menguji media",paragraphs:["Tentukan komoditas, wadah, serta kondisi tempat tumbuh. Pilih bahan yang bersih dan sesuai fungsi. Kompos matang umumnya telah stabil, tidak panas, tidak berbau menyengat, dan bahan asalnya sudah banyak terurai; ciri visual saja tidak menjamin seluruh aspek keamanannya. Hindari pupuk kandang segar langsung pada bibit.","Ayak bahan bila diperlukan, campur merata, dan pastikan lubang wadah berfungsi. Uji campuran menggunakan wadah serta volume air yang sama. Catat aliran air dan kelembapan setelah waktu tertentu. Labeli campuran agar hasil uji dapat dibandingkan, lalu pilih atau perbaiki campuran berdasarkan pengamatan."]},{title:"Kasus: akar membusuk pada pot",paragraphs:["Media pada pot selalu tergenang meskipun tanaman tidak kekurangan penyiraman. Periksa apakah lubang drainase tersumbat, media terlalu padat, atau pemberian air terlalu sering. Menambah pupuk tidak memperbaiki seluruh penyebab tersebut.","Bandingkan pot dengan drainase baik dan media yang lebih berpori sesuai komoditas. Pertanian organik juga menuntut pengelolaan kesuburan, sumber bahan, serta lingkungan secara menyeluruh; penggunaan kompos saja tidak otomatis membuktikan suatu produk telah memenuhi sertifikasi organik."]}],tasks:["Bandingkan tekstur tiga bahan media secara aman.","Siapkan dua campuran kecil dengan label yang jelas.","Uji aliran air menggunakan wadah dan volume yang sama.","Catat alasan memilih campuran untuk satu komoditas."],reflection:"Apa yang akan kamu ubah jika media cepat kering, dan data apa yang perlu diperiksa dahulu?",quiz:[Xe("Drainase media berfungsi untuk\u2026",["Mengalirkan air berlebih","Menutup semua pori","Mengganti kebutuhan cahaya"],0,"Drainase mengurangi genangan. Media tetap perlu menyimpan kelembapan yang sesuai."),Xe("Bahan organik yang lebih tepat untuk media bibit adalah\u2026",["Pupuk kandang segar yang masih panas","Kompos matang dengan mutu yang sesuai","Sampah campuran yang belum dipilah"],1,"Bahan matang lebih stabil. Pupuk kandang segar dapat mengganggu bibit."),Xe("Perbandingan campuran media sebaiknya\u2026",["Selalu sama untuk semua tanaman","Ditentukan hanya dari warna wadah","Disesuaikan dengan komoditas dan diuji sifatnya"],2,"Kebutuhan akar dan kondisi lingkungan berbeda, sehingga campuran perlu disesuaikan.")],sources:[tn]},{id:"benih",title:"Benih, persemaian, dan mutu bibit",emoji:"\u{1F331}",category:"Budidaya",zone:"Kebun praktik",level:"X\u2013XI",minutes:10,summary:"Pilih benih, kelola persemaian, dan tentukan bibit yang layak dipindah.",terms:["daya berkecambah","daun sejati","penjarangan","hardening"],objectives:["Memeriksa informasi mutu benih.","Menjaga kelembapan dan kebersihan persemaian.","Menentukan bibit sehat serta merencanakan adaptasi sebelum pindah tanam."],sections:[{title:"Benih baik adalah awal produksi",paragraphs:["Benih adalah bahan tanam untuk perbanyakan generatif. Periksa jenis dan varietas, asal, informasi lot, masa berlaku atau petunjuk penyimpanan, serta mutu kemasan. Benih yang tampak utuh belum tentu memiliki daya berkecambah tinggi; pengujian diperlukan untuk menilai kemampuannya.","Kotiledon adalah daun lembaga, sedangkan daun sejati muncul setelah pertumbuhan awal. Penilaian bibit mencakup kondisi batang, daun, akar, keseragaman, serta bebas gejala gangguan. Bibit layak pindah mengikuti komoditas dan perkembangannya, bukan satu umur yang berlaku untuk semua tanaman."]},{title:"Mengelola persemaian",paragraphs:["Siapkan wadah dan media bersih, labeli tanggal serta varietas, lalu semai sesuai petunjuk kedalaman benih. Jaga media lembap menggunakan aliran air lembut. Sediakan cahaya dan perlindungan yang sesuai; hindari genangan dan kepadatan berlebihan.","Amati kemunculan kecambah dan pertumbuhan setiap hari. Lakukan penjarangan bila dibutuhkan. Sebelum pindah tanam, adaptasikan bibit secara bertahap terhadap kondisi tujuan melalui hardening sesuai komoditas. Saat memindahkan, pegang dengan hati-hati dan pertahankan gumpalan media di sekitar akar."]},{title:"Kasus: mengukur keberhasilan semai",paragraphs:["Dalam latihan sederhana, 40 benih disemai dan 32 berkecambah normal pada akhir periode pengamatan yang ditetapkan. Persentase hasil pengamatan adalah 32 \xF7 40 \xD7 100% = 80%. Ini merupakan latihan kelas, bukan otomatis hasil uji sertifikasi benih.","Jika hasil rendah, periksa mutu awal, penyimpanan, kelembapan, suhu, kedalaman, dan lama pengamatan. Jangan langsung menyimpulkan seluruh kegagalan berasal dari benih. Catatan perlakuan membantu menemukan penyebab yang dapat diperbaiki."]}],tasks:["Baca dan catat informasi pada satu kemasan benih.","Semai sampel dengan label tanggal serta jumlah benih.","Hitung kecambah normal pada waktu yang disepakati guru.","Pilih bibit sehat dan jelaskan rencana adaptasinya."],reflection:"Faktor selain mutu benih apa yang dapat menurunkan keberhasilan persemaian?",quiz:[Xe("Dari 40 benih, 32 berkecambah normal. Persentasenya\u2026",["60%","80%","125%"],1,"32 dibagi 40, lalu dikalikan 100%, menghasilkan 80%."),Xe("Hardening sebelum pindah tanam bertujuan untuk\u2026",["Mengadaptasikan bibit secara bertahap","Mengeringkan bibit sampai layu berat","Membuat semua bibit berumur sama"],0,"Adaptasi bertahap membantu bibit menghadapi perbedaan kondisi persemaian dan lahan."),Xe("Cara menyiram bibit muda yang tepat adalah\u2026",["Semburan kuat agar media cepat padat","Selalu merendam seluruh daun","Aliran lembut dengan jumlah sesuai kebutuhan media"],2,"Aliran lembut mengurangi kerusakan bibit dan perpindahan media.")],sources:[tn]},{id:"tanam",title:"Pengolahan lahan dan penanaman",emoji:"\u{1F33E}",category:"Budidaya",zone:"Kebun praktik",level:"X\u2013XI",minutes:9,summary:"Siapkan tempat tumbuh, atur jarak, dan pindahkan bibit dengan benar.",terms:["bedengan","jarak tanam","penyulaman","mulsa"],objectives:["Menentukan kebutuhan penyiapan lahan atau wadah.","Menjelaskan pengaruh jarak tanam.","Melakukan pindah tanam serta pengamatan awal."],sections:[{title:"Penanaman mengikuti rencana produksi",paragraphs:["Penyiapan lahan bertujuan membentuk lingkungan akar yang sesuai, bukan sekadar menggemburkan tanah sebanyak mungkin. Pertimbangkan kemiringan, aliran air, kondisi tanah, komoditas, musim, serta cara kerja kelompok. Bedengan dapat membantu pengaturan area tanam dan drainase jika cocok dengan kondisi lahan.","Jarak tanam mengatur ruang tumbuh, populasi, akses perawatan, dan kondisi mikro di sekitar tanaman. Terlalu rapat dapat meningkatkan persaingan dan mengurangi sirkulasi udara; terlalu renggang dapat menurunkan pemanfaatan lahan. Ikuti rekomendasi komoditas dan tujuan produksi."]},{title:"Dari persiapan sampai pemeliharaan awal",paragraphs:["Bersihkan area sesuai kebutuhan dan kelola residu dengan tepat. Periksa drainase, bentuk bedengan bila diperlukan, serta beri penanda baris dan lubang. Siapkan bibit sehat; lembapkan media secukupnya agar gumpalan akar tetap utuh.","Pindahkan bibit tanpa merusak akar atau menimbun titik tumbuh secara tidak tepat. Padatkan ringan area sekitar akar dan siram secukupnya. Pilih waktu yang mengurangi stres sesuai cuaca. Amati tanaman setelah penanaman; penyulaman dilakukan dengan bibit sehat dan mempertimbangkan keseragaman pertumbuhan."]},{title:"Kasus: populasi pada petak latihan",paragraphs:["Petak latihan berukuran 2 m \xD7 1 m direncanakan memakai jarak 25 cm \xD7 25 cm. Pembagian luas sederhana menghasilkan 2 \xF7 (0,25 \xD7 0,25) = 32 titik secara teoritis. Angka ini belum memperhitungkan tepi, pola baris, dan ruang akses.","Gambarkan penempatan titik pada petak sebelum menentukan kebutuhan bibit sebenarnya. Hitung titik pada gambar atau lahan, sediakan cadangan sesuai rencana guru, dan catat bibit yang dipakai serta tanaman yang hidup."]}],tasks:["Buat sketsa petak dan arah aliran air.","Tentukan jarak sesuai satu komoditas yang dipilih guru.","Tandai titik tanam lalu hitung kebutuhan bibit nyata.","Amati tanaman setelah pindah tanam dan catat kebutuhan penyulaman."],reflection:"Mengapa hasil perhitungan populasi dari luas perlu diperiksa kembali pada sketsa atau lahan?",quiz:[Xe("Jarak tanam memengaruhi\u2026",["Hanya warna daun","Ruang tumbuh, populasi, serta kemudahan perawatan","Hanya harga wadah"],1,"Jarak memengaruhi persaingan sumber daya, kondisi mikro, dan akses kerja."),Xe("Saat memindahkan bibit, yang perlu dijaga adalah\u2026",["Gumpalan media dan akar agar tidak rusak","Semua akar harus diputus","Daun ditarik agar bibit terlepas"],0,"Kerusakan akar yang tidak perlu dapat meningkatkan stres pindah tanam."),Xe("Penyulaman adalah\u2026",["Menutup semua tanaman dengan tanah","Memanen tanaman paling kecil","Mengganti tanaman yang mati atau tidak tumbuh baik sesuai kebutuhan"],2,"Penyulaman membantu mempertahankan populasi dengan mempertimbangkan waktu dan keseragaman pertumbuhan.")],sources:[tn]},{id:"air",title:"Penyiraman dan pengelolaan air",emoji:"\u{1F4A7}",category:"Budidaya",zone:"Kebun praktik",level:"X\u2013XI",minutes:9,summary:"Tentukan kebutuhan air dari kondisi tanaman, media, dan cuaca.",terms:["irigasi","evapotranspirasi","kelembapan","drainase"],objectives:["Menjelaskan mengapa jadwal air berbeda antartanaman.","Membedakan kekurangan air dan genangan melalui pengamatan.","Menyusun catatan penyiraman."],sections:[{title:"Air cukup, akar tetap bernapas",paragraphs:["Tanaman memerlukan air untuk proses kehidupan, tetapi kebutuhan air tidak tetap. Cuaca, jenis tanaman, fase pertumbuhan, ukuran tajuk, serta sifat media ikut memengaruhinya. Air juga hilang dari permukaan media melalui penguapan dan dari tanaman melalui transpirasi.","Pori media perlu menyediakan air dan udara. Genangan berkepanjangan dapat menghambat akar. Layu tidak selalu berarti kurang air; gangguan akar pada media sangat basah juga dapat menyebabkan tanaman tampak layu. Periksa media dan tanaman sebelum mengambil keputusan."]},{title:"Menentukan tindakan penyiraman",paragraphs:["Amati kelembapan zona akar dengan cara yang disepakati guru, periksa wadah serta aliran air, dan catat cuaca. Gunakan metode pemberian air yang tidak merusak bibit atau membuang media. Sesuaikan jumlah serta frekuensi dengan hasil pengamatan, bukan hanya kebiasaan tetap.","Hindari membiarkan sistem menyiram terus tanpa pemeriksaan. Pada irigasi tetes, periksa apakah penetes tersumbat dan aliran merata. Catat waktu, perkiraan volume, kondisi awal, serta kondisi setelah penyiraman agar keputusan berikutnya dapat dievaluasi."]},{title:"Kasus: dua pot, satu jadwal",paragraphs:["Dua pot berisi komoditas sama: satu memakai media lebih berpori, satu lebih menahan air. Jika keduanya selalu menerima volume dan jadwal identik, hasil kelembapan belum tentu sama.","Bandingkan kondisi akar dan media sebelum menyiram. Ubah satu perlakuan pada satu waktu dan amati hasilnya. Tujuannya bukan membuat seluruh pot menerima angka yang sama, melainkan memenuhi kebutuhan tanaman dengan penggunaan air yang tepat."]}],tasks:["Catat cuaca dan kondisi media pada dua wadah.","Periksa lubang drainase atau aliran penetes.","Lakukan penyiraman sesuai arahan guru dan catat jumlahnya.","Bandingkan kelembapan sebelum dan setelah perlakuan."],reflection:"Apa yang perlu diperiksa jika tanaman layu tetapi medianya masih sangat basah?",quiz:[Xe("Kebutuhan air tanaman dipengaruhi oleh\u2026",["Cuaca, komoditas, fase tumbuh, dan media","Warna label saja","Jumlah anggota kelompok saja"],0,"Kebutuhan air berubah bersama kondisi tanaman dan lingkungannya."),Xe("Tanaman layu pada media tergenang. Langkah awal yang tepat\u2026",["Langsung menambah air sebanyak mungkin","Memeriksa drainase serta kondisi akar dan media","Langsung menaikkan semua dosis pupuk"],1,"Layu dapat berkaitan dengan gangguan akar. Pemeriksaan mencegah tindakan yang memperburuk keadaan."),Xe("Catatan penyiraman berguna untuk\u2026",["Menggantikan semua pengamatan","Membuktikan semua pot harus disiram sama","Mengevaluasi hubungan perlakuan air dan kondisi tanaman"],2,"Log membantu membandingkan tindakan dengan hasil pengamatan berikutnya.")],sources:[Ao,tn]},{id:"nutrisi",title:"Pemupukan dan kesuburan media",emoji:"\u{1F342}",category:"Budidaya",zone:"Laboratorium",level:"X\u2013XI",minutes:10,summary:"Pahami kebutuhan unsur hara dan gunakan pupuk berdasarkan data.",terms:["unsur hara","makro","mikro","pemupukan berimbang"],objectives:["Membedakan unsur hara makro dan mikro.","Menjelaskan bahwa gejala daun perlu didiagnosis.","Merencanakan aplikasi pupuk sesuai rekomendasi komoditas."],sections:[{title:"Hara diperlukan dalam keseimbangan",paragraphs:["Unsur hara mendukung pembentukan jaringan dan proses fisiologis tanaman. Unsur makro dibutuhkan dalam jumlah relatif lebih banyak daripada unsur mikro; mikro tetap penting meskipun kebutuhannya kecil. Kekurangan maupun kelebihan unsur dapat mengganggu pertumbuhan.","Pupuk organik dan anorganik mempunyai sifat serta kecepatan penyediaan hara yang berbeda. Kompos matang juga berperan pada kondisi media. Banyaknya pupuk tidak otomatis menentukan hasil; kebutuhan tanaman, ketersediaan hara, pH, air, dan kesehatan akar harus dipertimbangkan bersama."]},{title:"Menentukan aplikasi secara bertanggung jawab",paragraphs:["Identifikasi komoditas dan fase tumbuh. Gunakan hasil uji tanah atau media bila tersedia dan ikuti rekomendasi yang sesuai serta label produk. Hitung jumlah untuk luas atau volume aktual, gunakan alat ukur yang layak, dan catat jenis, dosis, waktu, serta cara pemberian.","Hindari kontak pekatan pupuk langsung dengan bibit jika tidak sesuai petunjuk. Jangan mencampur bahan tanpa mengetahui kompatibilitasnya. Pada latihan, guru menetapkan bahan dan jumlah yang digunakan. Periksa perubahan tanaman serta media setelah aplikasi sebelum memutuskan tindakan berikutnya."]},{title:"Kasus: daun menguning",paragraphs:["Daun menguning dapat berhubungan dengan hara, gangguan akar, kondisi air, penyakit, atau faktor lingkungan. Melihat warna saja belum cukup untuk memilih pupuk. Perhatikan daun tua atau muda yang terkena, pola gejala, kondisi akar, serta riwayat perlakuan.","Susun dugaan awal, kumpulkan data pendukung, dan konsultasikan kepada guru. Jika media ternyata tergenang, memperbaiki air dan drainase dapat lebih tepat daripada menambah pupuk. Diagnosis berbasis pengamatan mengurangi pemborosan dan kerusakan."]}],tasks:["Baca label satu bahan pemupukan yang disediakan guru.","Catat komoditas dan fase tumbuh yang akan diberi perlakuan.","Hitung kebutuhan dari rekomendasi yang telah ditetapkan.","Amati respons dan tulis kemungkinan faktor lain yang berpengaruh."],reflection:"Mengapa daun menguning tidak boleh langsung disimpulkan sebagai kekurangan satu unsur hara?",quiz:[Xe("Unsur mikro berarti\u2026",["Unsur yang tidak penting","Unsur yang dibutuhkan relatif sedikit tetapi tetap penting","Unsur yang hanya ada di tanaman kecil"],1,"Istilah makro dan mikro mengacu pada jumlah kebutuhan relatif, bukan tingkat kepentingannya."),Xe("Prinsip pemupukan yang tepat adalah\u2026",["Memberi sebanyak mungkin","Memakai dosis sama untuk semua komoditas","Menyesuaikan kebutuhan dan rekomendasi serta mencatat aplikasi"],2,"Pemupukan perlu mempertimbangkan komoditas, fase tumbuh, kondisi media, dan petunjuk penggunaan."),Xe("Daun menguning sebaiknya ditindaklanjuti dengan\u2026",["Pengamatan pola gejala, akar, air, dan riwayat perlakuan","Langsung menggandakan pupuk","Menutup seluruh daun"],0,"Gejala yang mirip dapat memiliki penyebab berbeda sehingga diagnosis diperlukan.")],sources:[tn,cc]},{id:"opt",title:"Pengamatan dan pengendalian OPT",emoji:"\u{1F50E}",category:"Budidaya",zone:"Greenhouse",level:"XI",minutes:10,summary:"Amati gejala, kenali organisme, dan tentukan tindakan pengendalian terpadu.",terms:["OPT","PHT","musuh alami","sanitasi"],objectives:["Membedakan gejala gangguan dan penyebabnya.","Mencatat kondisi tanaman serta organisme yang ditemukan.","Menyusun tindakan pengendalian terpadu."],sections:[{title:"Tidak semua serangga adalah hama",paragraphs:["Organisme pengganggu tumbuhan mencakup organisme yang merugikan tanaman, seperti hama, penyebab penyakit, dan gulma. Gejala adalah perubahan yang tampak pada tanaman; gejala belum selalu menunjukkan satu penyebab tertentu. Serangga di kebun juga dapat berperan sebagai penyerbuk atau musuh alami.","Pengendalian hama terpadu menggabungkan pencegahan, pemantauan, dan pilihan tindakan yang sesuai kondisi. Penanaman tanaman sehat, kebersihan, pengaturan lingkungan, serta pelestarian organisme bermanfaat membantu mengurangi risiko gangguan."]},{title:"Mengambil keputusan dari pengamatan",paragraphs:["Periksa tanaman secara teratur pada beberapa titik yang mewakili kebun. Catat bagian terserang, pola sebaran, tingkat kerusakan, organisme yang ditemukan, serta kondisi cuaca. Foto atau sketsa dapat membantu diskusi identifikasi dengan guru.","Utamakan tindakan yang sesuai hasil pemeriksaan, seperti sanitasi, perbaikan budidaya, pengambilan hama secara aman, atau pemanfaatan musuh alami. Jika penggunaan pestisida dinilai perlu, keputusan dan pelaksanaannya mengikuti ketentuan, label, serta pengawasan petugas yang kompeten. Praktik siswa tidak berupa pencampuran atau penyemprotan mandiri."]},{title:"Kasus: daun berlubang dan kumbang di kebun",paragraphs:["Daun berlubang tidak otomatis membuktikan setiap kumbang yang ditemukan adalah penyebabnya. Periksa waktu munculnya kerusakan, bagian tanaman, keberadaan ulat atau organisme lain, dan sebarannya.","Pisahkan fakta dari dugaan. Buat rencana pengamatan lanjutan, pilih tindakan yang sesuai, lalu evaluasi apakah kerusakan berkurang. Catat pula dampaknya terhadap tanaman dan organisme bermanfaat, bukan sekadar jumlah organisme yang hilang."]}],tasks:["Amati tanaman pada beberapa titik yang ditentukan guru.","Buat catatan gejala tanpa langsung menetapkan penyebab.","Diskusikan kemungkinan hama dan organisme bermanfaat.","Susun satu tindakan pencegahan serta cara mengevaluasinya."],reflection:"Bagaimana cara membedakan fakta pengamatan dari dugaan penyebab gangguan?",quiz:[Xe("Langkah awal ketika ada daun berlubang adalah\u2026",["Mengamati gejala dan mengidentifikasi kemungkinan penyebab","Langsung menyemprot seluruh kebun","Membuang semua serangga"],0,"Pengamatan membantu memilih tindakan yang tepat dan melindungi organisme bermanfaat."),Xe("Musuh alami adalah\u2026",["Semua tanaman liar","Organisme yang membantu menekan populasi hama tertentu","Nama lain pupuk organik"],1,"Predator atau parasitoid tertentu dapat berperan menekan hama."),Xe("Keberhasilan pengendalian perlu dinilai melalui\u2026",["Bau bahan yang digunakan","Banyaknya bahan yang disemprot","Pengamatan ulang kondisi tanaman dan gangguannya"],2,"Evaluasi menunjukkan apakah tindakan memperbaiki kondisi kebun dan apakah ada dampak lain.")],sources:[Th,{label:"How to practice IPM \u2014 FAO",url:"https://www.fao.org/agriculture/crops/thematic-sitemap/theme/spi/scpi-home/managing-ecosystems/integrated-pest-management/ipm-how/en/"}]},{id:"hidroponik",title:"Dasar hidroponik dan monitoring nutrisi",emoji:"\u{1F9EA}",category:"Teknologi",zone:"Greenhouse",level:"XI",minutes:10,summary:"Kenali sistem tanpa tanah dan pahami fungsi pengukuran pH serta EC.",terms:["larutan nutrisi","pH","EC","TDS"],objectives:["Menjelaskan prinsip hidroponik.","Membedakan fungsi pH dan EC.","Membuat log monitoring larutan nutrisi."],sections:[{title:"Tanpa tanah tetap memerlukan hara",paragraphs:["Hidroponik merupakan budidaya tanpa tanah dengan penyediaan unsur hara melalui larutan. Sebagian sistem memakai media penopang. Tanaman tetap membutuhkan cahaya, air, udara di daerah akar, serta nutrisi yang sesuai; hidroponik tidak menghapus kebutuhan tersebut.","pH menunjukkan tingkat keasaman atau kebasaan larutan. EC menunjukkan daya hantar listrik yang berkaitan dengan total ion terlarut; EC tidak menjelaskan komposisi setiap unsur. Nilai TDS pada alat umumnya merupakan estimasi dari EC dengan faktor konversi tertentu, sehingga pembacaan antarskala dapat berbeda."]},{title:"Memantau sistem dengan benar",paragraphs:["Kenali jenis sistem yang digunakan dan kebutuhan komoditas. Periksa kebersihan wadah, volume air, aliran atau sumbu, serta kondisi akar. Kalibrasi alat sesuai petunjuk produsennya sebelum mengandalkan hasil pengukuran.","Catat tanggal, fase tumbuh, suhu larutan bila tersedia, pH, EC beserta satuannya, serta tindakan koreksi. Target mengikuti komoditas dan petunjuk nutrisi, bukan satu angka untuk semua tanaman. Ikuti urutan pencampuran pada label; hindari mencampur dua larutan stok pekat langsung satu sama lain. Penyesuaian larutan dilakukan di bawah arahan guru."]},{title:"Kasus: angka EC tampak normal, tanaman terganggu",paragraphs:["EC berada pada kisaran target kegiatan, tetapi tanaman tetap tumbuh buruk. Periksa pH, kondisi akar, oksigenasi, suhu, aliran, kualitas air, serta komposisi nutrisi. Angka EC saja belum membuktikan semua unsur tersedia secara seimbang.","Gunakan data beberapa hari, bukan satu angka sesaat. Catat perubahan setelah koreksi dan lakukan satu tindakan terukur sesuai instruksi guru. Hindari menambahkan nutrisi terus-menerus hanya karena ingin tanaman tumbuh lebih cepat."]}],tasks:["Gambar alur air atau larutan pada sistem sekolah.","Periksa alat ukur dan prosedur kalibrasinya.","Ukur pH serta EC di bawah arahan guru dan tulis satuannya.","Bandingkan hasil dengan target komoditas yang disediakan guru."],reflection:"Mengapa nilai EC yang sesuai belum tentu menjamin tanaman menerima nutrisi seimbang?",quiz:[Xe("pH larutan menunjukkan\u2026",["Jumlah daun tanaman","Tingkat keasaman atau kebasaan","Kedalaman semua akar"],1,"pH berkaitan dengan sifat asam-basa larutan dan dapat memengaruhi ketersediaan hara."),Xe("EC menunjukkan\u2026",["Daya hantar listrik yang berkaitan dengan ion terlarut","Identitas dan jumlah pasti setiap unsur","Usia panen tanaman"],0,"EC merupakan indikator gabungan ion, bukan analisis lengkap setiap unsur hara."),Xe("Target pH dan EC sebaiknya mengikuti\u2026",["Satu angka untuk seluruh tanaman","Warna netpot","Komoditas, fase tumbuh, dan petunjuk nutrisi"],2,"Kebutuhan larutan berbeda menurut tanaman dan kondisi pengelolaan.")],sources:[cc,tn]},{id:"panen",title:"Panen dan penanganan pascapanen",emoji:"\u{1F9FA}",category:"Pascapanen",zone:"Pasar desa",level:"X\u2013XI",minutes:9,summary:"Tentukan kematangan panen dan pertahankan mutu sampai konsumen.",terms:["kematangan","sortasi","grading","susut hasil"],objectives:["Menentukan indikator panen sesuai komoditas.","Membedakan sortasi dan grading.","Merencanakan penanganan yang mengurangi kerusakan."],sections:[{title:"Panen ditentukan oleh tujuan produk",paragraphs:["Indikator panen dapat berupa umur, ukuran, warna, kekerasan, atau ciri lain yang sesuai komoditas dan tujuan pasar. Tidak semua tanaman dipanen setelah bagian yang dimakan matang penuh. Sayuran daun dan buah untuk pasar yang berbeda dapat mempunyai kriteria panen berbeda pula.","Mutu dipengaruhi kondisi sebelum panen dan cara penanganannya. Luka mekanis, panas berlebih, kehilangan air, serta kontaminasi dapat menurunkan nilai produk. Wadah dan alat harus bersih serta sesuai dengan karakter hasil."]},{title:"Dari kebun ke wadah penjualan",paragraphs:["Tentukan kriteria, jadwal, serta alat panen bersama guru. Panen dengan hati-hati; hindari melempar, menginjak, atau menumpuk hasil terlalu tinggi. Letakkan di lokasi yang terlindung dari panas berlebih dan pertahankan kebersihan.","Sortasi memisahkan hasil yang tidak sesuai atau rusak. Grading mengelompokkan hasil menurut kriteria mutu tertentu, misalnya ukuran dan kondisi. Pencucian, pengemasan, suhu, serta kelembapan penyimpanan dipilih sesuai komoditas; tidak semua produk memerlukan perlakuan yang sama. Catat hasil layak jual dan kehilangan."]},{title:"Kasus: panen banyak, hasil jual sedikit",paragraphs:["Kelompok memanen 20 kg sayuran, tetapi 3 kg rusak sebelum dijual. Hasil layak jual tinggal 17 kg. Persentase kehilangan berdasarkan berat awal adalah 3 \xF7 20 \xD7 100% = 15%.","Telusuri kapan kerusakan terjadi: saat dipetik, dibawa, disortir, dikemas, atau disimpan. Coba perbaikan yang terukur, seperti wadah lebih sesuai dan pengurangan tekanan tumpukan. Bandingkan susut pada panen berikutnya dengan kondisi yang tercatat."]}],tasks:["Tentukan tiga indikator panen untuk satu komoditas.","Periksa kebersihan alat dan kelayakan wadah.","Peragakan sortasi serta grading berdasarkan contoh guru.","Timbang dan catat hasil awal, layak jual, dan rusak."],reflection:"Tahap pascapanen mana yang paling berpotensi menimbulkan kerusakan pada komoditas kelompokmu?",quiz:[Xe("Perbedaan sortasi dan grading adalah\u2026",["Keduanya selalu berarti mencuci","Sortasi hanya untuk daun","Sortasi memisahkan yang tidak sesuai; grading mengelompokkan mutu"],2,"Keduanya membantu memenuhi persyaratan produk, tetapi tujuan pengelompokannya berbeda."),Xe("Dari 20 kg panen, 3 kg rusak. Persentase kehilangannya\u2026",["15%","3%","85%"],0,"3 dibagi 20 dikalikan 100% adalah 15%."),Xe("Perlakuan penyimpanan hasil panen harus\u2026",["Sama persis untuk semua komoditas","Disesuaikan dengan kebutuhan komoditas","Selalu diletakkan di terik matahari"],1,"Suhu, kelembapan, kemasan, dan perlakuan lain mengikuti karakter hasil.")],sources:[tn]},{id:"usaha",title:"Pencatatan dan analisis usaha tani",emoji:"\u{1F4CA}",category:"Pascapanen",zone:"Pasar desa",level:"XI",minutes:10,summary:"Hitung biaya, penerimaan, dan hasil usaha dari data sederhana.",terms:["biaya","penerimaan","laba","titik impas"],objectives:["Membedakan biaya dan penerimaan.","Menghitung laba atau rugi sederhana.","Menilai dampak susut serta perubahan harga."],sections:[{title:"Produksi perlu dibaca sebagai usaha",paragraphs:["Usaha tani menghubungkan input, proses produksi, hasil, dan pasar. Biaya dapat meliputi benih, media, pupuk, air, tenaga kerja, kemasan, transportasi, dan alokasi penggunaan alat. Dalam latihan sederhana, jelaskan biaya yang sudah dihitung dan yang belum agar kesimpulan tidak menyesatkan.","Penerimaan penjualan dihitung dari jumlah produk yang terjual dikalikan harga jual. Laba sederhana merupakan penerimaan dikurangi seluruh biaya yang diperhitungkan. Hasil panen yang belum terjual tidak otomatis menjadi penerimaan tunai."]},{title:"Membuat catatan yang dapat diperiksa",paragraphs:["Catat transaksi pada tanggal kejadian, pisahkan jumlah barang, satuan, harga satuan, dan total. Simpan bukti bila tersedia. Buat log produksi berisi kegiatan, pemakaian bahan, tenaga, hasil panen, susut, dan jumlah yang terjual.","Jumlahkan biaya serta penerimaan pada periode yang sama. Bandingkan dengan rencana. Untuk latihan titik impas harga, bagi total biaya dengan jumlah produk layak jual yang diasumsikan seluruhnya terjual. Jelaskan asumsi itu dan coba skenario harga atau susut yang berubah."]},{title:"Kasus: usaha sayuran kelompok",paragraphs:["Asumsikan seluruh biaya satu siklus Rp120.000. Produk layak jual 20 ikat dan semuanya terjual Rp8.000 per ikat. Penerimaan = 20 \xD7 Rp8.000 = Rp160.000; laba sederhana = Rp160.000 \u2212 Rp120.000 = Rp40.000. Titik impas harga rata-rata adalah Rp120.000 \xF7 20 = Rp6.000 per ikat.","Jika hanya 15 ikat terjual pada harga Rp8.000, penerimaan menjadi Rp120.000. Jangan menyebut usaha pasti untung hanya dari jumlah panen. Periksa produk tak terjual, biaya yang terlewat, dan strategi pasar. Angka ini ilustrasi pembelajaran, bukan perkiraan harga pasar saat ini."]}],tasks:["Buat tabel tanggal, transaksi, jumlah, satuan, dan total.","Pisahkan pengeluaran dan penerimaan kelompok.","Hitung hasil usaha dengan menyebut biaya yang diperhitungkan.","Uji satu skenario penurunan penjualan atau kenaikan biaya."],reflection:"Biaya apa yang mudah terlupa saat kelompok menghitung keuntungan praktik sekolah?",quiz:[Xe("20 ikat terjual Rp8.000 per ikat. Penerimaannya\u2026",["Rp120.000","Rp160.000","Rp40.000"],1,"Penerimaan adalah jumlah terjual dikalikan harga jual: 20 \xD7 Rp8.000."),Xe("Penerimaan Rp160.000 dan biaya Rp120.000 menghasilkan\u2026",["Laba Rp40.000","Laba Rp280.000","Rugi Rp40.000"],0,"Laba sederhana = penerimaan \u2212 biaya yang diperhitungkan."),Xe("Jika biaya Rp120.000 dan 20 ikat semuanya terjual, titik impas harganya\u2026",["Rp12.000 per ikat","Rp2.400.000 per ikat","Rp6.000 per ikat"],2,"Rp120.000 dibagi 20 ikat menghasilkan Rp6.000 per ikat dengan asumsi yang disebutkan.")],sources:[tn]},{id:"smart",title:"Smart Garden dan dasar IoT pertanian",emoji:"\u{1F4E1}",category:"Teknologi",zone:"Laboratorium",level:"XI",minutes:10,summary:"Pahami alur sensor, pengendali, data, dan aktuator untuk merawat tanaman.",terms:["sensor","aktuator","kalibrasi","ambang"],objectives:["Membedakan sensor dan aktuator.","Menyusun logika penyiraman sederhana.","Menjelaskan perlunya kalibrasi dan penanganan kegagalan."],sections:[{title:"Teknologi membantu keputusan budidaya",paragraphs:["Sensor membaca kondisi, misalnya kelembapan media atau suhu udara. Pengendali menerima data dan menjalankan logika. Aktuator melakukan tindakan fisik, misalnya pompa atau katup. Koneksi jaringan dapat mengirim hasil pengamatan ke dashboard sehingga perubahan dapat dipantau dari lokasi lain.","Angka dari sensor perlu dimaknai. Sensor kelembapan dengan pembacaan relatif tidak otomatis menunjukkan persentase kadar air tanah yang akurat. Kalibrasi dan pembandingan dengan kondisi nyata diperlukan. Dashboard yang menarik tidak menggantikan pemeriksaan tanaman di lapangan."]},{title:"Menyusun sistem latihan yang dapat dipercaya",paragraphs:["Mulai dengan tujuan: kapan air perlu diberikan dan bagaimana memastikan jumlahnya tidak berlebih? Tentukan sensor, rentang pengamatan, batas keputusan, serta durasi kerja pompa. Logika dapat memakai ambang hidup dan ambang mati yang berbeda agar pompa tidak terlalu sering berganti keadaan.","Rencanakan kegagalan: data tidak masuk, sensor terlepas, tangki kosong, atau jaringan terputus. Batasi waktu pompa menyala dan sediakan kendali manual. Praktik siswa memakai rangkaian tegangan rendah yang disiapkan guru; sambungan listrik bertegangan berbahaya bukan bagian kegiatan mandiri. Uji simulasi logika sebelum menerapkan pada tanaman."]},{title:"Kasus: pompa menyala terus",paragraphs:["Sensor melaporkan nilai yang sama sangat lama dan sistem terus menyiram. Jangan langsung menyimpulkan media selalu kering. Periksa sambungan sensor, kondisi alat, pembacaan pembanding, serta tangki dan aliran.","Sistem yang lebih baik mengenali data yang tidak wajar, membatasi durasi pompa, dan memberi tanda untuk pemeriksaan manusia. Pada game, diskusikan rancangan ini sebagai latihan; dunia AgroQuest saat ini tidak mengendalikan pompa fisik atau perangkat IoT nyata."]}],tasks:["Gambar alur sensor \u2192 pengendali \u2192 aktuator.","Buat tiga contoh data kelembapan dan keputusan sistem.","Tambahkan kondisi berhenti serta batas waktu penyiraman.","Uji skenario sensor terlepas melalui simulasi atau diskusi."],reflection:"Apa yang seharusnya dilakukan sistem saat data sensor hilang atau tidak masuk akal?",quiz:[Xe("Manakah yang merupakan aktuator?",["Sensor kelembapan","Pompa air","Angka pada tabel"],1,"Aktuator melakukan tindakan fisik. Sensor bertugas membaca kondisi."),Xe("Kalibrasi dan pembandingan sensor diperlukan agar\u2026",["Warna dashboard lebih menarik","Semua tanaman selalu mendapat air sama","Pembacaan dapat dikaitkan dengan kondisi nyata"],2,"Nilai sensor perlu diuji terhadap kondisi yang ingin diukur."),Xe("Jika sensor gagal dan pompa berisiko terus menyala, sistem sebaiknya\u2026",["Membatasi kerja pompa dan meminta pemeriksaan","Mengabaikan kegagalan","Menambah durasi pompa tanpa batas"],0,"Penanganan kegagalan membantu mencegah penyiraman berlebih dan kerusakan sistem.")],sources:[tn,Ao]}];var tt=a=>document.getElementById(a);function uc({state:a,save:e,modal:n,toast:i,travel:s,game:r,renderHUD:o}){a.learning=a.learning&&typeof a.learning=="object"?a.learning:{};let l="Semua",u="",c="",h=T=>a.learning[T]||(a.learning[T]={read:!1,tasks:[],reflection:"",best:0,attempts:0,rewarded:!1,answers:[]}),f=T=>{n(T,!0),tt("modal").classList.add("learning"),tt("modal").scrollTop=0};function p(T=""){c=T,l="Semua",u="";let _=Ai.filter(A=>h(A.id).read).length,x=Ai.filter(A=>h(A.id).best>=2).length;f(`<div class="learn-hero"><div class="tiny">PERPUSTAKAAN ATPH \xB7 SMK KELAS X\u2013XI</div><h2 id="modaltitle">Bekal ilmu untuk petualanganmu.</h2><p>Pahami konsepnya, coba di kebun, lalu uji pemahamanmu. Pilih dari 12 materi mandiri yang bisa dipelajari sesuai arahan guru.</p><div class="learn-stats"><span>\u{1F4DA} <b>${_}/12</b> bacaan selesai</span><span>\u2726 <b>${x}/12</b> latihan tuntas</span><span>\u{1F4DD} Catatan pribadi</span></div></div><div class="learn-controls"><label for="materialsearch" class="sr-only">Cari materi pembelajaran</label><input id="materialsearch" type="search" placeholder="Cari topik, istilah, atau lokasi\u2026" autocomplete="off"><div class="learn-filters" role="group" aria-label="Kategori materi">${["Semua","Dasar","Budidaya","Teknologi","Pascapanen"].map((A,E)=>`<button class="learn-filter ${E===0?"selected":""}" data-category="${A}" aria-pressed="${E===0}">${A}</button>`).join("")}</div><div class="learn-zone" id="zonefilter" ${T?"":"hidden"}><span id="zonefiltername"></span><button id="clearzone">Lihat semua lokasi \xD7</button></div></div><div class="row"><span class="muted" id="materialcount" role="status"></span><span class="muted">12 materi \xB7 36 soal latihan</span></div><div class="learn-grid" id="materialgrid"></div><p class="smallnote">Ringkasan dan kegiatan disusun untuk pembelajaran game. Guru menyesuaikan urutan, komoditas, dan SOP praktik sekolah. Progres dan refleksi tersimpan di browser perangkat ini, belum menjadi rapor kelas.</p>`),tt("materialsearch").oninput=A=>{u=A.target.value.toLocaleLowerCase("id-ID"),g()},document.querySelectorAll("[data-category]").forEach(A=>A.onclick=()=>{l=A.dataset.category,document.querySelectorAll("[data-category]").forEach(E=>{E.classList.toggle("selected",E===A),E.setAttribute("aria-pressed",String(E===A))}),g()}),tt("clearzone").onclick=()=>{c="",tt("zonefilter").hidden=!0,g()},g()}function g(){c&&(tt("zonefiltername").textContent="\u{1F4CD} Materi di "+c,tt("zonefilter").hidden=!1);let T=Ai.filter(_=>(l==="Semua"||_.category===l)&&(!c||y(_,c))&&(!u||[_.title,_.summary,_.zone,_.category,..._.terms].join(" ").toLocaleLowerCase("id-ID").includes(u)));tt("materialcount").textContent=T.length+" materi ditemukan",tt("materialgrid").innerHTML=T.length?T.map(_=>{let x=h(_.id);return`<article class="learn-card"><div class="row"><span class="learn-emoji">${_.emoji}</span><span class="learn-badge">Kelas ${_.level}</span></div><span class="tiny">${_.category} \xB7 ${_.minutes} menit</span><h3>${_.title}</h3><p>${_.summary}</p><div class="learn-card-location">\u{1F4CD} ${_.zone}</div><div class="learn-card-status"><span>${x.read?"\u2713 Sudah dibaca":"\u25CB Belum selesai"}</span><span>${x.attempts?"Latihan "+x.best+"/3":"3 soal latihan"}</span></div><button data-material="${_.id}">${x.read?"Buka kembali \u2192":"Mulai belajar \u2192"}</button></article>`}).join(""):'<div class="learn-empty">Belum ada topik yang cocok. Coba kata kunci lain atau tampilkan semua lokasi.</div>',document.querySelectorAll("[data-material]").forEach(_=>_.onclick=()=>v(_.dataset.material))}function y(T,_){return _==="Desa Tunas"||_==="Telaga teduh"?["tumbuh","air","panen"].includes(T.id):_==="Atelier kreatif"||_==="Jalur penjelajah"?["k3","smart","usaha"].includes(T.id):T.zone===_}function v(T,_=0){let x=Ai.find(C=>C.id===T);if(!x)return p();let A=h(T);a.learningLast=T,e();let E=["Konsep","Langkah kerja","Studi kasus","Praktik & refleksi","Latihan"];f(`<div class="learn-toprow"><button class="learn-back" id="backlibrary">\u2190 Semua materi</button><span class="muted">${x.category} \xB7 Kelas ${x.level} \xB7 ${x.minutes} menit</span></div><div class="learn-layout"><aside class="learn-sidebar"><span class="learn-topic-icon">${x.emoji}</span><h3>${x.title}</h3><p>\u{1F4CD} ${x.zone}</p><nav aria-label="Bagian materi">${E.map((C,P)=>`<button class="learn-tab ${P===_?"active":""}" data-section="${P}" aria-current="${P===_?"step":"false"}"><span>${P+1}</span>${C}</button>`).join("")}</nav><div class="learn-sidebar-status">${A.read?"\u2713 Bacaan selesai":"\u25CB Bacaan belum ditandai"}<br>${A.attempts?"Nilai terbaik: "+A.best+"/3":"Latihan belum dikerjakan"}</div></aside><article class="learn-content" id="learningcontent"><div class="tiny">BAGIAN ${_+1} DARI 5</div><h2 id="modaltitle">${_<3?x.sections[_].title:E[_]}</h2><div id="learningbody"></div><div class="learn-page-nav"><button id="prevsection" ${_===0?"disabled":""}>\u2190 Sebelumnya</button><button id="nextsection" ${_===4?"disabled":""}>${_===2?"Lanjut praktik \u2192":"Selanjutnya \u2192"}</button></div></article></div>`),tt("backlibrary").onclick=()=>p(),document.querySelectorAll("[data-section]").forEach(C=>C.onclick=()=>v(T,+C.dataset.section)),tt("prevsection").onclick=()=>v(T,_-1),tt("nextsection").onclick=()=>v(T,_+1),_<3?(tt("learningbody").innerHTML=(_===0?`<div class="learn-objectives"><h4>Tujuan belajar</h4><ul>${x.objectives.map(C=>`<li>${C}</li>`).join("")}</ul></div>`:"")+x.sections[_].paragraphs.map(C=>`<p>${C}</p>`).join("")+(_===0?`<div class="learn-terms"><span class="tiny">ISTILAH KUNCI</span><div>${x.terms.map(C=>`<span>${C}</span>`).join("")}</div></div>`:"")+(_===2?`<div class="learn-callout"><strong>Dari bacaan ke keputusan</strong><p>Diskusikan kasus ini bersama kelompok. Jelaskan tindakan yang dipilih, alasan, dan data yang masih perlu dikumpulkan.</p></div><button class="primary" id="markread">${A.read?"\u2713 Bacaan sudah ditandai selesai":"Tandai bacaan selesai"}</button><div class="learn-sources"><h4>Bacaan lanjutan</h4>${x.sources.map(C=>`<a href="${C.url}" target="_blank" rel="noopener noreferrer">${C.label} \u2197</a>`).join("")}<p class="smallnote">Teks di game adalah penjelasan pembelajaran tersendiri, bukan kutipan utuh atau pengganti SOP sekolah.</p></div>`:""),_===2&&(tt("markread").onclick=()=>{A.read=!0,e(),v(T,3),i("Bacaan ditandai selesai. Lanjutkan praktik dan refleksi.")})):_===3?(tt("learningbody").innerHTML=`<p>Kerjakan kegiatan nyata dengan arahan guru, atau diskusikan rancangan jika alat belum tersedia. Centang kegiatan setelah benar-benar dilakukan.</p><div class="learn-checklist">${x.tasks.map((C,P)=>`<label><input type="checkbox" data-task="${P}" ${A.tasks?.[P]?"checked":""}><span>${C}</span></label>`).join("")}</div><div class="learn-callout"><strong>Refleksi pribadimu</strong><p>${x.reflection}</p><label for="learningreflection" class="sr-only">Jawaban refleksi</label><textarea id="learningreflection" maxlength="1200" rows="5" placeholder="Tuliskan hasil pengamatan, alasan, atau pertanyaanmu\u2026"></textarea><span class="muted" id="reflectionstatus" role="status">Catatan otomatis disimpan di perangkat ini.</span></div><button class="secondary-btn" id="visitlearningzone">Kunjungi ${x.zone} di game \u2192</button><p class="smallnote">Pertumbuhan tanaman dalam game dipercepat dan aktivitasnya disederhanakan. Praktik kebun nyata mengikuti kebutuhan komoditas dan instruksi guru.</p>`,document.querySelectorAll("[data-task]").forEach(C=>C.onchange=()=>{A.tasks=A.tasks||[],A.tasks[+C.dataset.task]=C.checked,e()}),tt("learningreflection").value=A.reflection||"",tt("learningreflection").oninput=C=>{A.reflection=C.target.value,e(),tt("reflectionstatus").textContent="\u2713 Refleksi tersimpan di perangkat ini."},tt("visitlearningzone").onclick=()=>{let C={"Alun-alun":[0,12],"Kebun praktik":[-17,-4.5],Laboratorium:[0,-20],Greenhouse:[-18,-20],"Pasar desa":[12,13]}[x.zone]||[0,12];s(x.zone,...C)}):m(x,A)}function m(T,_){let x=Array.isArray(_.answers)?_.answers.slice():[];tt("learningbody").innerHTML=`<p>Tiga soal untuk mengecek pemahamanmu. Pilih semua jawaban lalu periksa hasilnya. Dua jawaban benar menuntaskan latihan; kamu boleh mencoba lagi untuk memperbaiki nilai.</p><div class="learn-scoreline">${_.attempts?"Nilai terbaik: <b>"+_.best+"/3</b> \xB7 "+_.attempts+" percobaan":"Belum ada hasil latihan"}${_.rewarded?" \xB7 Hadiah sudah diterima":" \xB7 Hadiah pertama: 30 XP + 10 koin"}</div><form id="learningquiz">${T.quiz.map((A,E)=>`<fieldset class="learn-question"><legend>${E+1}. ${A.text}</legend>${A.options.map((C,P)=>`<label><input type="radio" name="material-question-${E}" value="${P}" data-question="${E}" ${x[E]===P?"checked":""}><span>${C}</span></label>`).join("")}<div class="learn-explanation" id="explanation-${E}" hidden></div></fieldset>`).join("")}<p id="quizmessage" role="status"></p><button class="primary" type="submit" id="checklearning">Periksa jawaban</button></form><button class="secondary-btn" id="retrylearning" hidden>Coba latihan lagi</button>`,document.querySelectorAll("[data-question]").forEach(A=>A.onchange=()=>{x[+A.dataset.question]=+A.value,_.answers=x,e()}),tt("learningquiz").onsubmit=A=>{if(A.preventDefault(),T.quiz.some((C,P)=>!Number.isInteger(x[P]))){tt("quizmessage").textContent="Jawab ketiga soal sebelum memeriksa hasilnya.";return}let E=0;T.quiz.forEach((C,P)=>{let M=x[P]===C.answer;M&&E++;let w=tt("explanation-"+P);w.hidden=!1,w.className="learn-explanation "+(M?"correct":"wrong"),w.textContent=(M?"\u2713 Benar. ":"Belum tepat. Jawaban: "+C.options[C.answer]+". ")+C.explanation,document.querySelectorAll(`[data-question="${P}"]`).forEach(I=>I.disabled=!0)}),_.attempts++,_.best=Math.max(_.best||0,E),E>=2&&!_.rewarded&&(_.rewarded=!0,a.farmXP+=30,a.bank+=10,o(),i("Latihan tuntas! +30 XP dan +10 koin.")),e(),document.querySelector(".learn-sidebar-status").innerHTML=(_.read?"\u2713 Bacaan selesai":"\u25CB Bacaan belum ditandai")+"<br>Nilai terbaik: "+_.best+"/3",document.querySelector(".learn-scoreline").textContent="Nilai terbaik: "+_.best+"/3 \xB7 "+_.attempts+" percobaan"+(_.rewarded?" \xB7 Hadiah sudah diterima":""),tt("quizmessage").textContent="Hasil: "+E+"/3. "+(E>=2?"Latihan tuntas. Baca penjelasan setiap soal.":"Baca kembali penjelasan lalu coba lagi."),tt("checklearning").disabled=!0,tt("retrylearning").hidden=!1,tt("retrylearning").onclick=()=>{_.answers=[],e(),v(T.id,4)}}}let d=()=>p(r()?.getZone()||"Alun-alun");return tt("navmaterials").onclick=()=>p(),tt("learnnear").onclick=d,{library:p,open:v,forZone:d,materials:Ai}}/**
 * @license
 * Copyright 2010-2025 Three.js Authors
 * SPDX-License-Identifier: MIT
 */var Bc=0,ll=1,Oc=2;var cl=1,yr=2,yn=3,Cn=0,Bt=1,Ht=2,In=0,li=1,ul=2,hl=3,dl=4,zc=5,Gn=100,Hc=101,Vc=102,Gc=103,Wc=104,Xc=200,qc=201,jc=202,Yc=203,Vs=204,Gs=205,$c=206,Kc=207,Jc=208,Zc=209,Qc=210,eu=211,tu=212,nu=213,iu=214,xr=0,_r=1,br=2,ci=3,vr=4,Mr=5,Sr=6,wr=7,fl=0,au=1,su=2,Ln=0,ru=1,ou=2,lu=3,Tr=4,cu=5,uu=6,hu=7;var pl=300,gi=301,yi=302,Er=303,Ar=304,Za=306,Ws=1e3,Hn=1001,Xs=1002,Qt=1003,du=1004;var Qa=1005;var on=1006,kr=1007;var $n=1008;var un=1009,ml=1010,gl=1011,ta=1012,Cr=1013,Kn=1014,xn=1015,na=1016,Rr=1017,Pr=1018,ia=1020,yl=35902,xl=35899,_l=1021,bl=1022,en=1023,Xi=1026,aa=1027,vl=1028,Ir=1029,Ml=1030,Lr=1031;var Dr=1033,es=33776,ts=33777,ns=33778,is=33779,Ur=35840,Nr=35841,Fr=35842,Br=35843,Or=36196,zr=37492,Hr=37496,Vr=37808,Gr=37809,Wr=37810,Xr=37811,qr=37812,jr=37813,Yr=37814,$r=37815,Kr=37816,Jr=37817,Zr=37818,Qr=37819,eo=37820,to=37821,no=36492,io=36494,ao=36495,so=36283,ro=36284,oo=36285,lo=36286;var Aa=2300,qs=2301,zs=2302,el=2400,tl=2401,nl=2402;var fu=3200,pu=3201;var Sl=0,mu=1,Dn="",Et="srgb",ui="srgb-linear",ka="linear",nt="srgb";var oi=7680;var il=519,gu=512,yu=513,xu=514,wl=515,_u=516,bu=517,vu=518,Mu=519,js=35044;var Tl="300 es",rn=2e3,Ca=2001;var Rn=class{addEventListener(e,n){this._listeners===void 0&&(this._listeners={});let i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(n)===-1&&i[e].push(n)}hasEventListener(e,n){let i=this._listeners;return i===void 0?!1:i[e]!==void 0&&i[e].indexOf(n)!==-1}removeEventListener(e,n){let i=this._listeners;if(i===void 0)return;let s=i[e];if(s!==void 0){let r=s.indexOf(n);r!==-1&&s.splice(r,1)}}dispatchEvent(e){let n=this._listeners;if(n===void 0)return;let i=n[e.type];if(i!==void 0){e.target=this;let s=i.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,e);e.target=null}}},Ct=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var Hs=Math.PI/180,Ys=180/Math.PI;function Vn(){let a=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(Ct[a&255]+Ct[a>>8&255]+Ct[a>>16&255]+Ct[a>>24&255]+"-"+Ct[e&255]+Ct[e>>8&255]+"-"+Ct[e>>16&15|64]+Ct[e>>24&255]+"-"+Ct[n&63|128]+Ct[n>>8&255]+"-"+Ct[n>>16&255]+Ct[n>>24&255]+Ct[i&255]+Ct[i>>8&255]+Ct[i>>16&255]+Ct[i>>24&255]).toLowerCase()}function je(a,e,n){return Math.max(e,Math.min(n,a))}function Eh(a,e){return(a%e+e)%e}function ko(a,e,n){return(1-n)*a+n*e}function fn(a,e){switch(e.constructor){case Float32Array:return a;case Uint32Array:return a/4294967295;case Uint16Array:return a/65535;case Uint8Array:return a/255;case Int32Array:return Math.max(a/2147483647,-1);case Int16Array:return Math.max(a/32767,-1);case Int8Array:return Math.max(a/127,-1);default:throw new Error("Invalid component type.")}}function at(a,e){switch(e.constructor){case Float32Array:return a;case Uint32Array:return Math.round(a*4294967295);case Uint16Array:return Math.round(a*65535);case Uint8Array:return Math.round(a*255);case Int32Array:return Math.round(a*2147483647);case Int16Array:return Math.round(a*32767);case Int8Array:return Math.round(a*127);default:throw new Error("Invalid component type.")}}var Be=class a{constructor(e=0,n=0){a.prototype.isVector2=!0,this.x=e,this.y=n}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,n){return this.x=e,this.y=n,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,n){switch(e){case 0:this.x=n;break;case 1:this.y=n;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,n){return this.x=e.x+n.x,this.y=e.y+n.y,this}addScaledVector(e,n){return this.x+=e.x*n,this.y+=e.y*n,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,n){return this.x=e.x-n.x,this.y=e.y-n.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let n=this.x,i=this.y,s=e.elements;return this.x=s[0]*n+s[3]*i+s[6],this.y=s[1]*n+s[4]*i+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,n){return this.x=je(this.x,e.x,n.x),this.y=je(this.y,e.y,n.y),this}clampScalar(e,n){return this.x=je(this.x,e,n),this.y=je(this.y,e,n),this}clampLength(e,n){let i=this.length();return this.divideScalar(i||1).multiplyScalar(je(i,e,n))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let n=Math.sqrt(this.lengthSq()*e.lengthSq());if(n===0)return Math.PI/2;let i=this.dot(e)/n;return Math.acos(je(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let n=this.x-e.x,i=this.y-e.y;return n*n+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,n){return this.x+=(e.x-this.x)*n,this.y+=(e.y-this.y)*n,this}lerpVectors(e,n,i){return this.x=e.x+(n.x-e.x)*i,this.y=e.y+(n.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,n=0){return this.x=e[n],this.y=e[n+1],this}toArray(e=[],n=0){return e[n]=this.x,e[n+1]=this.y,e}fromBufferAttribute(e,n){return this.x=e.getX(n),this.y=e.getY(n),this}rotateAround(e,n){let i=Math.cos(n),s=Math.sin(n),r=this.x-e.x,o=this.y-e.y;return this.x=r*i-o*s+e.x,this.y=r*s+o*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Pn=class{constructor(e=0,n=0,i=0,s=1){this.isQuaternion=!0,this._x=e,this._y=n,this._z=i,this._w=s}static slerpFlat(e,n,i,s,r,o,l){let u=i[s+0],c=i[s+1],h=i[s+2],f=i[s+3],p=r[o+0],g=r[o+1],y=r[o+2],v=r[o+3];if(l===0){e[n+0]=u,e[n+1]=c,e[n+2]=h,e[n+3]=f;return}if(l===1){e[n+0]=p,e[n+1]=g,e[n+2]=y,e[n+3]=v;return}if(f!==v||u!==p||c!==g||h!==y){let m=1-l,d=u*p+c*g+h*y+f*v,T=d>=0?1:-1,_=1-d*d;if(_>Number.EPSILON){let A=Math.sqrt(_),E=Math.atan2(A,d*T);m=Math.sin(m*E)/A,l=Math.sin(l*E)/A}let x=l*T;if(u=u*m+p*x,c=c*m+g*x,h=h*m+y*x,f=f*m+v*x,m===1-l){let A=1/Math.sqrt(u*u+c*c+h*h+f*f);u*=A,c*=A,h*=A,f*=A}}e[n]=u,e[n+1]=c,e[n+2]=h,e[n+3]=f}static multiplyQuaternionsFlat(e,n,i,s,r,o){let l=i[s],u=i[s+1],c=i[s+2],h=i[s+3],f=r[o],p=r[o+1],g=r[o+2],y=r[o+3];return e[n]=l*y+h*f+u*g-c*p,e[n+1]=u*y+h*p+c*f-l*g,e[n+2]=c*y+h*g+l*p-u*f,e[n+3]=h*y-l*f-u*p-c*g,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,n,i,s){return this._x=e,this._y=n,this._z=i,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,n=!0){let i=e._x,s=e._y,r=e._z,o=e._order,l=Math.cos,u=Math.sin,c=l(i/2),h=l(s/2),f=l(r/2),p=u(i/2),g=u(s/2),y=u(r/2);switch(o){case"XYZ":this._x=p*h*f+c*g*y,this._y=c*g*f-p*h*y,this._z=c*h*y+p*g*f,this._w=c*h*f-p*g*y;break;case"YXZ":this._x=p*h*f+c*g*y,this._y=c*g*f-p*h*y,this._z=c*h*y-p*g*f,this._w=c*h*f+p*g*y;break;case"ZXY":this._x=p*h*f-c*g*y,this._y=c*g*f+p*h*y,this._z=c*h*y+p*g*f,this._w=c*h*f-p*g*y;break;case"ZYX":this._x=p*h*f-c*g*y,this._y=c*g*f+p*h*y,this._z=c*h*y-p*g*f,this._w=c*h*f+p*g*y;break;case"YZX":this._x=p*h*f+c*g*y,this._y=c*g*f+p*h*y,this._z=c*h*y-p*g*f,this._w=c*h*f-p*g*y;break;case"XZY":this._x=p*h*f-c*g*y,this._y=c*g*f-p*h*y,this._z=c*h*y+p*g*f,this._w=c*h*f+p*g*y;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return n===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,n){let i=n/2,s=Math.sin(i);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){let n=e.elements,i=n[0],s=n[4],r=n[8],o=n[1],l=n[5],u=n[9],c=n[2],h=n[6],f=n[10],p=i+l+f;if(p>0){let g=.5/Math.sqrt(p+1);this._w=.25/g,this._x=(h-u)*g,this._y=(r-c)*g,this._z=(o-s)*g}else if(i>l&&i>f){let g=2*Math.sqrt(1+i-l-f);this._w=(h-u)/g,this._x=.25*g,this._y=(s+o)/g,this._z=(r+c)/g}else if(l>f){let g=2*Math.sqrt(1+l-i-f);this._w=(r-c)/g,this._x=(s+o)/g,this._y=.25*g,this._z=(u+h)/g}else{let g=2*Math.sqrt(1+f-i-l);this._w=(o-s)/g,this._x=(r+c)/g,this._y=(u+h)/g,this._z=.25*g}return this._onChangeCallback(),this}setFromUnitVectors(e,n){let i=e.dot(n)+1;return i<1e-8?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*n.z-e.z*n.y,this._y=e.z*n.x-e.x*n.z,this._z=e.x*n.y-e.y*n.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(je(this.dot(e),-1,1)))}rotateTowards(e,n){let i=this.angleTo(e);if(i===0)return this;let s=Math.min(1,n/i);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,n){let i=e._x,s=e._y,r=e._z,o=e._w,l=n._x,u=n._y,c=n._z,h=n._w;return this._x=i*h+o*l+s*c-r*u,this._y=s*h+o*u+r*l-i*c,this._z=r*h+o*c+i*u-s*l,this._w=o*h-i*l-s*u-r*c,this._onChangeCallback(),this}slerp(e,n){if(n===0)return this;if(n===1)return this.copy(e);let i=this._x,s=this._y,r=this._z,o=this._w,l=o*e._w+i*e._x+s*e._y+r*e._z;if(l<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,l=-l):this.copy(e),l>=1)return this._w=o,this._x=i,this._y=s,this._z=r,this;let u=1-l*l;if(u<=Number.EPSILON){let g=1-n;return this._w=g*o+n*this._w,this._x=g*i+n*this._x,this._y=g*s+n*this._y,this._z=g*r+n*this._z,this.normalize(),this}let c=Math.sqrt(u),h=Math.atan2(c,l),f=Math.sin((1-n)*h)/c,p=Math.sin(n*h)/c;return this._w=o*f+this._w*p,this._x=i*f+this._x*p,this._y=s*f+this._y*p,this._z=r*f+this._z*p,this._onChangeCallback(),this}slerpQuaternions(e,n,i){return this.copy(e).slerp(n,i)}random(){let e=2*Math.PI*Math.random(),n=2*Math.PI*Math.random(),i=Math.random(),s=Math.sqrt(1-i),r=Math.sqrt(i);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(n),r*Math.cos(n))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,n=0){return this._x=e[n],this._y=e[n+1],this._z=e[n+2],this._w=e[n+3],this._onChangeCallback(),this}toArray(e=[],n=0){return e[n]=this._x,e[n+1]=this._y,e[n+2]=this._z,e[n+3]=this._w,e}fromBufferAttribute(e,n){return this._x=e.getX(n),this._y=e.getY(n),this._z=e.getZ(n),this._w=e.getW(n),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},U=class a{constructor(e=0,n=0,i=0){a.prototype.isVector3=!0,this.x=e,this.y=n,this.z=i}set(e,n,i){return i===void 0&&(i=this.z),this.x=e,this.y=n,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,n){switch(e){case 0:this.x=n;break;case 1:this.y=n;break;case 2:this.z=n;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,n){return this.x=e.x+n.x,this.y=e.y+n.y,this.z=e.z+n.z,this}addScaledVector(e,n){return this.x+=e.x*n,this.y+=e.y*n,this.z+=e.z*n,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,n){return this.x=e.x-n.x,this.y=e.y-n.y,this.z=e.z-n.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,n){return this.x=e.x*n.x,this.y=e.y*n.y,this.z=e.z*n.z,this}applyEuler(e){return this.applyQuaternion(hc.setFromEuler(e))}applyAxisAngle(e,n){return this.applyQuaternion(hc.setFromAxisAngle(e,n))}applyMatrix3(e){let n=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*n+r[3]*i+r[6]*s,this.y=r[1]*n+r[4]*i+r[7]*s,this.z=r[2]*n+r[5]*i+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let n=this.x,i=this.y,s=this.z,r=e.elements,o=1/(r[3]*n+r[7]*i+r[11]*s+r[15]);return this.x=(r[0]*n+r[4]*i+r[8]*s+r[12])*o,this.y=(r[1]*n+r[5]*i+r[9]*s+r[13])*o,this.z=(r[2]*n+r[6]*i+r[10]*s+r[14])*o,this}applyQuaternion(e){let n=this.x,i=this.y,s=this.z,r=e.x,o=e.y,l=e.z,u=e.w,c=2*(o*s-l*i),h=2*(l*n-r*s),f=2*(r*i-o*n);return this.x=n+u*c+o*f-l*h,this.y=i+u*h+l*c-r*f,this.z=s+u*f+r*h-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let n=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*n+r[4]*i+r[8]*s,this.y=r[1]*n+r[5]*i+r[9]*s,this.z=r[2]*n+r[6]*i+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,n){return this.x=je(this.x,e.x,n.x),this.y=je(this.y,e.y,n.y),this.z=je(this.z,e.z,n.z),this}clampScalar(e,n){return this.x=je(this.x,e,n),this.y=je(this.y,e,n),this.z=je(this.z,e,n),this}clampLength(e,n){let i=this.length();return this.divideScalar(i||1).multiplyScalar(je(i,e,n))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,n){return this.x+=(e.x-this.x)*n,this.y+=(e.y-this.y)*n,this.z+=(e.z-this.z)*n,this}lerpVectors(e,n,i){return this.x=e.x+(n.x-e.x)*i,this.y=e.y+(n.y-e.y)*i,this.z=e.z+(n.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,n){let i=e.x,s=e.y,r=e.z,o=n.x,l=n.y,u=n.z;return this.x=s*u-r*l,this.y=r*o-i*u,this.z=i*l-s*o,this}projectOnVector(e){let n=e.lengthSq();if(n===0)return this.set(0,0,0);let i=e.dot(this)/n;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return Co.copy(this).projectOnVector(e),this.sub(Co)}reflect(e){return this.sub(Co.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let n=Math.sqrt(this.lengthSq()*e.lengthSq());if(n===0)return Math.PI/2;let i=this.dot(e)/n;return Math.acos(je(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let n=this.x-e.x,i=this.y-e.y,s=this.z-e.z;return n*n+i*i+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,n,i){let s=Math.sin(n)*e;return this.x=s*Math.sin(i),this.y=Math.cos(n)*e,this.z=s*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,n,i){return this.x=e*Math.sin(n),this.y=i,this.z=e*Math.cos(n),this}setFromMatrixPosition(e){let n=e.elements;return this.x=n[12],this.y=n[13],this.z=n[14],this}setFromMatrixScale(e){let n=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=n,this.y=i,this.z=s,this}setFromMatrixColumn(e,n){return this.fromArray(e.elements,n*4)}setFromMatrix3Column(e,n){return this.fromArray(e.elements,n*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,n=0){return this.x=e[n],this.y=e[n+1],this.z=e[n+2],this}toArray(e=[],n=0){return e[n]=this.x,e[n+1]=this.y,e[n+2]=this.z,e}fromBufferAttribute(e,n){return this.x=e.getX(n),this.y=e.getY(n),this.z=e.getZ(n),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,n=Math.random()*2-1,i=Math.sqrt(1-n*n);return this.x=i*Math.cos(e),this.y=n,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Co=new U,hc=new Pn,ze=class a{constructor(e,n,i,s,r,o,l,u,c){a.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,n,i,s,r,o,l,u,c)}set(e,n,i,s,r,o,l,u,c){let h=this.elements;return h[0]=e,h[1]=s,h[2]=l,h[3]=n,h[4]=r,h[5]=u,h[6]=i,h[7]=o,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let n=this.elements,i=e.elements;return n[0]=i[0],n[1]=i[1],n[2]=i[2],n[3]=i[3],n[4]=i[4],n[5]=i[5],n[6]=i[6],n[7]=i[7],n[8]=i[8],this}extractBasis(e,n,i){return e.setFromMatrix3Column(this,0),n.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let n=e.elements;return this.set(n[0],n[4],n[8],n[1],n[5],n[9],n[2],n[6],n[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,n){let i=e.elements,s=n.elements,r=this.elements,o=i[0],l=i[3],u=i[6],c=i[1],h=i[4],f=i[7],p=i[2],g=i[5],y=i[8],v=s[0],m=s[3],d=s[6],T=s[1],_=s[4],x=s[7],A=s[2],E=s[5],C=s[8];return r[0]=o*v+l*T+u*A,r[3]=o*m+l*_+u*E,r[6]=o*d+l*x+u*C,r[1]=c*v+h*T+f*A,r[4]=c*m+h*_+f*E,r[7]=c*d+h*x+f*C,r[2]=p*v+g*T+y*A,r[5]=p*m+g*_+y*E,r[8]=p*d+g*x+y*C,this}multiplyScalar(e){let n=this.elements;return n[0]*=e,n[3]*=e,n[6]*=e,n[1]*=e,n[4]*=e,n[7]*=e,n[2]*=e,n[5]*=e,n[8]*=e,this}determinant(){let e=this.elements,n=e[0],i=e[1],s=e[2],r=e[3],o=e[4],l=e[5],u=e[6],c=e[7],h=e[8];return n*o*h-n*l*c-i*r*h+i*l*u+s*r*c-s*o*u}invert(){let e=this.elements,n=e[0],i=e[1],s=e[2],r=e[3],o=e[4],l=e[5],u=e[6],c=e[7],h=e[8],f=h*o-l*c,p=l*u-h*r,g=c*r-o*u,y=n*f+i*p+s*g;if(y===0)return this.set(0,0,0,0,0,0,0,0,0);let v=1/y;return e[0]=f*v,e[1]=(s*c-h*i)*v,e[2]=(l*i-s*o)*v,e[3]=p*v,e[4]=(h*n-s*u)*v,e[5]=(s*r-l*n)*v,e[6]=g*v,e[7]=(i*u-c*n)*v,e[8]=(o*n-i*r)*v,this}transpose(){let e,n=this.elements;return e=n[1],n[1]=n[3],n[3]=e,e=n[2],n[2]=n[6],n[6]=e,e=n[5],n[5]=n[7],n[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let n=this.elements;return e[0]=n[0],e[1]=n[3],e[2]=n[6],e[3]=n[1],e[4]=n[4],e[5]=n[7],e[6]=n[2],e[7]=n[5],e[8]=n[8],this}setUvTransform(e,n,i,s,r,o,l){let u=Math.cos(r),c=Math.sin(r);return this.set(i*u,i*c,-i*(u*o+c*l)+o+e,-s*c,s*u,-s*(-c*o+u*l)+l+n,0,0,1),this}scale(e,n){return this.premultiply(Ro.makeScale(e,n)),this}rotate(e){return this.premultiply(Ro.makeRotation(-e)),this}translate(e,n){return this.premultiply(Ro.makeTranslation(e,n)),this}makeTranslation(e,n){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,n,0,0,1),this}makeRotation(e){let n=Math.cos(e),i=Math.sin(e);return this.set(n,-i,0,i,n,0,0,0,1),this}makeScale(e,n){return this.set(e,0,0,0,n,0,0,0,1),this}equals(e){let n=this.elements,i=e.elements;for(let s=0;s<9;s++)if(n[s]!==i[s])return!1;return!0}fromArray(e,n=0){for(let i=0;i<9;i++)this.elements[i]=e[i+n];return this}toArray(e=[],n=0){let i=this.elements;return e[n]=i[0],e[n+1]=i[1],e[n+2]=i[2],e[n+3]=i[3],e[n+4]=i[4],e[n+5]=i[5],e[n+6]=i[6],e[n+7]=i[7],e[n+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}},Ro=new ze;function El(a){for(let e=a.length-1;e>=0;--e)if(a[e]>=65535)return!0;return!1}function Ra(a){return document.createElementNS("http://www.w3.org/1999/xhtml",a)}function Su(){let a=Ra("canvas");return a.style.display="block",a}var dc={};function qi(a){a in dc||(dc[a]=!0,console.warn(a))}function wu(a,e,n){return new Promise(function(i,s){function r(){switch(a.clientWaitSync(e,a.SYNC_FLUSH_COMMANDS_BIT,0)){case a.WAIT_FAILED:s();break;case a.TIMEOUT_EXPIRED:setTimeout(r,n);break;default:i()}}setTimeout(r,n)})}var fc=new ze().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),pc=new ze().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Ah(){let a={enabled:!0,workingColorSpace:ui,spaces:{},convert:function(s,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===nt&&(s.r=kn(s.r),s.g=kn(s.g),s.b=kn(s.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===nt&&(s.r=Wi(s.r),s.g=Wi(s.g),s.b=Wi(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Dn?ka:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,o){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return qi("THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),a.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return qi("THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),a.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],n=[.2126,.7152,.0722],i=[.3127,.329];return a.define({[ui]:{primaries:e,whitePoint:i,transfer:ka,toXYZ:fc,fromXYZ:pc,luminanceCoefficients:n,workingColorSpaceConfig:{unpackColorSpace:Et},outputColorSpaceConfig:{drawingBufferColorSpace:Et}},[Et]:{primaries:e,whitePoint:i,transfer:nt,toXYZ:fc,fromXYZ:pc,luminanceCoefficients:n,outputColorSpaceConfig:{drawingBufferColorSpace:Et}}}),a}var Ye=Ah();function kn(a){return a<.04045?a*.0773993808:Math.pow(a*.9478672986+.0521327014,2.4)}function Wi(a){return a<.0031308?a*12.92:1.055*Math.pow(a,.41666)-.055}var ki,$s=class{static getDataURL(e,n="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let i;if(e instanceof HTMLCanvasElement)i=e;else{ki===void 0&&(ki=Ra("canvas")),ki.width=e.width,ki.height=e.height;let s=ki.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),i=ki}return i.toDataURL(n)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let n=Ra("canvas");n.width=e.width,n.height=e.height;let i=n.getContext("2d");i.drawImage(e,0,0,e.width,e.height);let s=i.getImageData(0,0,e.width,e.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=kn(r[o]/255)*255;return i.putImageData(s,0,0),n}else if(e.data){let n=e.data.slice(0);for(let i=0;i<n.length;i++)n instanceof Uint8Array||n instanceof Uint8ClampedArray?n[i]=Math.floor(kn(n[i]/255)*255):n[i]=kn(n[i]);return{data:n,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},kh=0,ji=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:kh++}),this.uuid=Vn(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let n=this.data;return typeof HTMLVideoElement<"u"&&n instanceof HTMLVideoElement?e.set(n.videoWidth,n.videoHeight,0):n instanceof VideoFrame?e.set(n.displayHeight,n.displayWidth,0):n!==null?e.set(n.width,n.height,n.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let n=e===void 0||typeof e=="string";if(!n&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let i={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,l=s.length;o<l;o++)s[o].isDataTexture?r.push(Po(s[o].image)):r.push(Po(s[o]))}else r=Po(s);i.url=r}return n||(e.images[this.uuid]=i),i}};function Po(a){return typeof HTMLImageElement<"u"&&a instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&a instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&a instanceof ImageBitmap?$s.getDataURL(a):a.data?{data:Array.from(a.data),width:a.width,height:a.height,type:a.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}var Ch=0,Io=new U,zt=class a extends Rn{constructor(e=a.DEFAULT_IMAGE,n=a.DEFAULT_MAPPING,i=Hn,s=Hn,r=on,o=$n,l=en,u=un,c=a.DEFAULT_ANISOTROPY,h=Dn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Ch++}),this.uuid=Vn(),this.name="",this.source=new ji(e),this.mipmaps=[],this.mapping=n,this.channel=0,this.wrapS=i,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=l,this.internalFormat=null,this.type=u,this.offset=new Be(0,0),this.repeat=new Be(1,1),this.center=new Be(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new ze,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(Io).x}get height(){return this.source.getSize(Io).y}get depth(){return this.source.getSize(Io).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,n){this.updateRanges.push({start:e,count:n})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let n in e){let i=e[n];if(i===void 0){console.warn(`THREE.Texture.setValues(): parameter '${n}' has value of undefined.`);continue}let s=this[n];if(s===void 0){console.warn(`THREE.Texture.setValues(): property '${n}' does not exist.`);continue}s&&i&&s.isVector2&&i.isVector2||s&&i&&s.isVector3&&i.isVector3||s&&i&&s.isMatrix3&&i.isMatrix3?s.copy(i):this[n]=i}}toJSON(e){let n=e===void 0||typeof e=="string";if(!n&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),n||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==pl)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Ws:e.x=e.x-Math.floor(e.x);break;case Hn:e.x=e.x<0?0:1;break;case Xs:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Ws:e.y=e.y-Math.floor(e.y);break;case Hn:e.y=e.y<0?0:1;break;case Xs:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};zt.DEFAULT_IMAGE=null;zt.DEFAULT_MAPPING=pl;zt.DEFAULT_ANISOTROPY=1;var gt=class a{constructor(e=0,n=0,i=0,s=1){a.prototype.isVector4=!0,this.x=e,this.y=n,this.z=i,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,n,i,s){return this.x=e,this.y=n,this.z=i,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,n){switch(e){case 0:this.x=n;break;case 1:this.y=n;break;case 2:this.z=n;break;case 3:this.w=n;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,n){return this.x=e.x+n.x,this.y=e.y+n.y,this.z=e.z+n.z,this.w=e.w+n.w,this}addScaledVector(e,n){return this.x+=e.x*n,this.y+=e.y*n,this.z+=e.z*n,this.w+=e.w*n,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,n){return this.x=e.x-n.x,this.y=e.y-n.y,this.z=e.z-n.z,this.w=e.w-n.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let n=this.x,i=this.y,s=this.z,r=this.w,o=e.elements;return this.x=o[0]*n+o[4]*i+o[8]*s+o[12]*r,this.y=o[1]*n+o[5]*i+o[9]*s+o[13]*r,this.z=o[2]*n+o[6]*i+o[10]*s+o[14]*r,this.w=o[3]*n+o[7]*i+o[11]*s+o[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let n=Math.sqrt(1-e.w*e.w);return n<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/n,this.y=e.y/n,this.z=e.z/n),this}setAxisAngleFromRotationMatrix(e){let n,i,s,r,u=e.elements,c=u[0],h=u[4],f=u[8],p=u[1],g=u[5],y=u[9],v=u[2],m=u[6],d=u[10];if(Math.abs(h-p)<.01&&Math.abs(f-v)<.01&&Math.abs(y-m)<.01){if(Math.abs(h+p)<.1&&Math.abs(f+v)<.1&&Math.abs(y+m)<.1&&Math.abs(c+g+d-3)<.1)return this.set(1,0,0,0),this;n=Math.PI;let _=(c+1)/2,x=(g+1)/2,A=(d+1)/2,E=(h+p)/4,C=(f+v)/4,P=(y+m)/4;return _>x&&_>A?_<.01?(i=0,s=.707106781,r=.707106781):(i=Math.sqrt(_),s=E/i,r=C/i):x>A?x<.01?(i=.707106781,s=0,r=.707106781):(s=Math.sqrt(x),i=E/s,r=P/s):A<.01?(i=.707106781,s=.707106781,r=0):(r=Math.sqrt(A),i=C/r,s=P/r),this.set(i,s,r,n),this}let T=Math.sqrt((m-y)*(m-y)+(f-v)*(f-v)+(p-h)*(p-h));return Math.abs(T)<.001&&(T=1),this.x=(m-y)/T,this.y=(f-v)/T,this.z=(p-h)/T,this.w=Math.acos((c+g+d-1)/2),this}setFromMatrixPosition(e){let n=e.elements;return this.x=n[12],this.y=n[13],this.z=n[14],this.w=n[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,n){return this.x=je(this.x,e.x,n.x),this.y=je(this.y,e.y,n.y),this.z=je(this.z,e.z,n.z),this.w=je(this.w,e.w,n.w),this}clampScalar(e,n){return this.x=je(this.x,e,n),this.y=je(this.y,e,n),this.z=je(this.z,e,n),this.w=je(this.w,e,n),this}clampLength(e,n){let i=this.length();return this.divideScalar(i||1).multiplyScalar(je(i,e,n))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,n){return this.x+=(e.x-this.x)*n,this.y+=(e.y-this.y)*n,this.z+=(e.z-this.z)*n,this.w+=(e.w-this.w)*n,this}lerpVectors(e,n,i){return this.x=e.x+(n.x-e.x)*i,this.y=e.y+(n.y-e.y)*i,this.z=e.z+(n.z-e.z)*i,this.w=e.w+(n.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,n=0){return this.x=e[n],this.y=e[n+1],this.z=e[n+2],this.w=e[n+3],this}toArray(e=[],n=0){return e[n]=this.x,e[n+1]=this.y,e[n+2]=this.z,e[n+3]=this.w,e}fromBufferAttribute(e,n){return this.x=e.getX(n),this.y=e.getY(n),this.z=e.getZ(n),this.w=e.getW(n),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Ks=class extends Rn{constructor(e=1,n=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:on,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},i),this.isRenderTarget=!0,this.width=e,this.height=n,this.depth=i.depth,this.scissor=new gt(0,0,e,n),this.scissorTest=!1,this.viewport=new gt(0,0,e,n);let s={width:e,height:n,depth:i.depth},r=new zt(s);this.textures=[];let o=i.count;for(let l=0;l<o;l++)this.textures[l]=r.clone(),this.textures[l].isRenderTargetTexture=!0,this.textures[l].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview}_setTextureOptions(e={}){let n={minFilter:on,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(n.mapping=e.mapping),e.wrapS!==void 0&&(n.wrapS=e.wrapS),e.wrapT!==void 0&&(n.wrapT=e.wrapT),e.wrapR!==void 0&&(n.wrapR=e.wrapR),e.magFilter!==void 0&&(n.magFilter=e.magFilter),e.minFilter!==void 0&&(n.minFilter=e.minFilter),e.format!==void 0&&(n.format=e.format),e.type!==void 0&&(n.type=e.type),e.anisotropy!==void 0&&(n.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(n.colorSpace=e.colorSpace),e.flipY!==void 0&&(n.flipY=e.flipY),e.generateMipmaps!==void 0&&(n.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(n.internalFormat=e.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(n)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,n,i=1){if(this.width!==e||this.height!==n||this.depth!==i){this.width=e,this.height=n,this.depth=i;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=n,this.textures[s].image.depth=i,this.textures[s].isArrayTexture=this.textures[s].image.depth>1;this.dispose()}this.viewport.set(0,0,e,n),this.scissor.set(0,0,e,n)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let n=0,i=e.textures.length;n<i;n++){this.textures[n]=e.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0,this.textures[n].renderTarget=this;let s=Object.assign({},e.textures[n].image);this.textures[n].source=new ji(s)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},mn=class extends Ks{constructor(e=1,n=1,i={}){super(e,n,i),this.isWebGLRenderTarget=!0}},Pa=class extends zt{constructor(e=null,n=1,i=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:n,height:i,depth:s},this.magFilter=Qt,this.minFilter=Qt,this.wrapR=Hn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var Js=class extends zt{constructor(e=null,n=1,i=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:n,height:i,depth:s},this.magFilter=Qt,this.minFilter=Qt,this.wrapR=Hn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Wn=class{constructor(e=new U(1/0,1/0,1/0),n=new U(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=n}set(e,n){return this.min.copy(e),this.max.copy(n),this}setFromArray(e){this.makeEmpty();for(let n=0,i=e.length;n<i;n+=3)this.expandByPoint(nn.fromArray(e,n));return this}setFromBufferAttribute(e){this.makeEmpty();for(let n=0,i=e.count;n<i;n++)this.expandByPoint(nn.fromBufferAttribute(e,n));return this}setFromPoints(e){this.makeEmpty();for(let n=0,i=e.length;n<i;n++)this.expandByPoint(e[n]);return this}setFromCenterAndSize(e,n){let i=nn.copy(n).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,n=!1){return this.makeEmpty(),this.expandByObject(e,n)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,n=!1){e.updateWorldMatrix(!1,!1);let i=e.geometry;if(i!==void 0){let r=i.getAttribute("position");if(n===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let o=0,l=r.count;o<l;o++)e.isMesh===!0?e.getVertexPosition(o,nn):nn.fromBufferAttribute(r,o),nn.applyMatrix4(e.matrixWorld),this.expandByPoint(nn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),ps.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),ps.copy(i.boundingBox)),ps.applyMatrix4(e.matrixWorld),this.union(ps)}let s=e.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],n);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,n){return n.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,nn),nn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let n,i;return e.normal.x>0?(n=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(n=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(n+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(n+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(n+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(n+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),n<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(_a),ms.subVectors(this.max,_a),Ci.subVectors(e.a,_a),Ri.subVectors(e.b,_a),Pi.subVectors(e.c,_a),Un.subVectors(Ri,Ci),Nn.subVectors(Pi,Ri),ii.subVectors(Ci,Pi);let n=[0,-Un.z,Un.y,0,-Nn.z,Nn.y,0,-ii.z,ii.y,Un.z,0,-Un.x,Nn.z,0,-Nn.x,ii.z,0,-ii.x,-Un.y,Un.x,0,-Nn.y,Nn.x,0,-ii.y,ii.x,0];return!Lo(n,Ci,Ri,Pi,ms)||(n=[1,0,0,0,1,0,0,0,1],!Lo(n,Ci,Ri,Pi,ms))?!1:(gs.crossVectors(Un,Nn),n=[gs.x,gs.y,gs.z],Lo(n,Ci,Ri,Pi,ms))}clampPoint(e,n){return n.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,nn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(nn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Sn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Sn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Sn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Sn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Sn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Sn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Sn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Sn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Sn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},Sn=[new U,new U,new U,new U,new U,new U,new U,new U],nn=new U,ps=new Wn,Ci=new U,Ri=new U,Pi=new U,Un=new U,Nn=new U,ii=new U,_a=new U,ms=new U,gs=new U,ai=new U;function Lo(a,e,n,i,s){for(let r=0,o=a.length-3;r<=o;r+=3){ai.fromArray(a,r);let l=s.x*Math.abs(ai.x)+s.y*Math.abs(ai.y)+s.z*Math.abs(ai.z),u=e.dot(ai),c=n.dot(ai),h=i.dot(ai);if(Math.max(-Math.max(u,c,h),Math.min(u,c,h))>l)return!1}return!0}var Rh=new Wn,ba=new U,Do=new U,hi=class{constructor(e=new U,n=-1){this.isSphere=!0,this.center=e,this.radius=n}set(e,n){return this.center.copy(e),this.radius=n,this}setFromPoints(e,n){let i=this.center;n!==void 0?i.copy(n):Rh.setFromPoints(e).getCenter(i);let s=0;for(let r=0,o=e.length;r<o;r++)s=Math.max(s,i.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let n=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=n*n}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,n){let i=this.center.distanceToSquared(e);return n.copy(e),i>this.radius*this.radius&&(n.sub(this.center).normalize(),n.multiplyScalar(this.radius).add(this.center)),n}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;ba.subVectors(e,this.center);let n=ba.lengthSq();if(n>this.radius*this.radius){let i=Math.sqrt(n),s=(i-this.radius)*.5;this.center.addScaledVector(ba,s/i),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Do.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(ba.copy(e.center).add(Do)),this.expandByPoint(ba.copy(e.center).sub(Do))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},wn=new U,Uo=new U,ys=new U,Fn=new U,No=new U,xs=new U,Fo=new U,Yi=class{constructor(e=new U,n=new U(0,0,-1)){this.origin=e,this.direction=n}set(e,n){return this.origin.copy(e),this.direction.copy(n),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,n){return n.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,wn)),this}closestPointToPoint(e,n){n.subVectors(e,this.origin);let i=n.dot(this.direction);return i<0?n.copy(this.origin):n.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let n=wn.subVectors(e,this.origin).dot(this.direction);return n<0?this.origin.distanceToSquared(e):(wn.copy(this.origin).addScaledVector(this.direction,n),wn.distanceToSquared(e))}distanceSqToSegment(e,n,i,s){Uo.copy(e).add(n).multiplyScalar(.5),ys.copy(n).sub(e).normalize(),Fn.copy(this.origin).sub(Uo);let r=e.distanceTo(n)*.5,o=-this.direction.dot(ys),l=Fn.dot(this.direction),u=-Fn.dot(ys),c=Fn.lengthSq(),h=Math.abs(1-o*o),f,p,g,y;if(h>0)if(f=o*u-l,p=o*l-u,y=r*h,f>=0)if(p>=-y)if(p<=y){let v=1/h;f*=v,p*=v,g=f*(f+o*p+2*l)+p*(o*f+p+2*u)+c}else p=r,f=Math.max(0,-(o*p+l)),g=-f*f+p*(p+2*u)+c;else p=-r,f=Math.max(0,-(o*p+l)),g=-f*f+p*(p+2*u)+c;else p<=-y?(f=Math.max(0,-(-o*r+l)),p=f>0?-r:Math.min(Math.max(-r,-u),r),g=-f*f+p*(p+2*u)+c):p<=y?(f=0,p=Math.min(Math.max(-r,-u),r),g=p*(p+2*u)+c):(f=Math.max(0,-(o*r+l)),p=f>0?r:Math.min(Math.max(-r,-u),r),g=-f*f+p*(p+2*u)+c);else p=o>0?-r:r,f=Math.max(0,-(o*p+l)),g=-f*f+p*(p+2*u)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,f),s&&s.copy(Uo).addScaledVector(ys,p),g}intersectSphere(e,n){wn.subVectors(e.center,this.origin);let i=wn.dot(this.direction),s=wn.dot(wn)-i*i,r=e.radius*e.radius;if(s>r)return null;let o=Math.sqrt(r-s),l=i-o,u=i+o;return u<0?null:l<0?this.at(u,n):this.at(l,n)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let n=e.normal.dot(this.direction);if(n===0)return e.distanceToPoint(this.origin)===0?0:null;let i=-(this.origin.dot(e.normal)+e.constant)/n;return i>=0?i:null}intersectPlane(e,n){let i=this.distanceToPlane(e);return i===null?null:this.at(i,n)}intersectsPlane(e){let n=e.distanceToPoint(this.origin);return n===0||e.normal.dot(this.direction)*n<0}intersectBox(e,n){let i,s,r,o,l,u,c=1/this.direction.x,h=1/this.direction.y,f=1/this.direction.z,p=this.origin;return c>=0?(i=(e.min.x-p.x)*c,s=(e.max.x-p.x)*c):(i=(e.max.x-p.x)*c,s=(e.min.x-p.x)*c),h>=0?(r=(e.min.y-p.y)*h,o=(e.max.y-p.y)*h):(r=(e.max.y-p.y)*h,o=(e.min.y-p.y)*h),i>o||r>s||((r>i||isNaN(i))&&(i=r),(o<s||isNaN(s))&&(s=o),f>=0?(l=(e.min.z-p.z)*f,u=(e.max.z-p.z)*f):(l=(e.max.z-p.z)*f,u=(e.min.z-p.z)*f),i>u||l>s)||((l>i||i!==i)&&(i=l),(u<s||s!==s)&&(s=u),s<0)?null:this.at(i>=0?i:s,n)}intersectsBox(e){return this.intersectBox(e,wn)!==null}intersectTriangle(e,n,i,s,r){No.subVectors(n,e),xs.subVectors(i,e),Fo.crossVectors(No,xs);let o=this.direction.dot(Fo),l;if(o>0){if(s)return null;l=1}else if(o<0)l=-1,o=-o;else return null;Fn.subVectors(this.origin,e);let u=l*this.direction.dot(xs.crossVectors(Fn,xs));if(u<0)return null;let c=l*this.direction.dot(No.cross(Fn));if(c<0||u+c>o)return null;let h=-l*Fn.dot(Fo);return h<0?null:this.at(h/o,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},ot=class a{constructor(e,n,i,s,r,o,l,u,c,h,f,p,g,y,v,m){a.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,n,i,s,r,o,l,u,c,h,f,p,g,y,v,m)}set(e,n,i,s,r,o,l,u,c,h,f,p,g,y,v,m){let d=this.elements;return d[0]=e,d[4]=n,d[8]=i,d[12]=s,d[1]=r,d[5]=o,d[9]=l,d[13]=u,d[2]=c,d[6]=h,d[10]=f,d[14]=p,d[3]=g,d[7]=y,d[11]=v,d[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new a().fromArray(this.elements)}copy(e){let n=this.elements,i=e.elements;return n[0]=i[0],n[1]=i[1],n[2]=i[2],n[3]=i[3],n[4]=i[4],n[5]=i[5],n[6]=i[6],n[7]=i[7],n[8]=i[8],n[9]=i[9],n[10]=i[10],n[11]=i[11],n[12]=i[12],n[13]=i[13],n[14]=i[14],n[15]=i[15],this}copyPosition(e){let n=this.elements,i=e.elements;return n[12]=i[12],n[13]=i[13],n[14]=i[14],this}setFromMatrix3(e){let n=e.elements;return this.set(n[0],n[3],n[6],0,n[1],n[4],n[7],0,n[2],n[5],n[8],0,0,0,0,1),this}extractBasis(e,n,i){return e.setFromMatrixColumn(this,0),n.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this}makeBasis(e,n,i){return this.set(e.x,n.x,i.x,0,e.y,n.y,i.y,0,e.z,n.z,i.z,0,0,0,0,1),this}extractRotation(e){let n=this.elements,i=e.elements,s=1/Ii.setFromMatrixColumn(e,0).length(),r=1/Ii.setFromMatrixColumn(e,1).length(),o=1/Ii.setFromMatrixColumn(e,2).length();return n[0]=i[0]*s,n[1]=i[1]*s,n[2]=i[2]*s,n[3]=0,n[4]=i[4]*r,n[5]=i[5]*r,n[6]=i[6]*r,n[7]=0,n[8]=i[8]*o,n[9]=i[9]*o,n[10]=i[10]*o,n[11]=0,n[12]=0,n[13]=0,n[14]=0,n[15]=1,this}makeRotationFromEuler(e){let n=this.elements,i=e.x,s=e.y,r=e.z,o=Math.cos(i),l=Math.sin(i),u=Math.cos(s),c=Math.sin(s),h=Math.cos(r),f=Math.sin(r);if(e.order==="XYZ"){let p=o*h,g=o*f,y=l*h,v=l*f;n[0]=u*h,n[4]=-u*f,n[8]=c,n[1]=g+y*c,n[5]=p-v*c,n[9]=-l*u,n[2]=v-p*c,n[6]=y+g*c,n[10]=o*u}else if(e.order==="YXZ"){let p=u*h,g=u*f,y=c*h,v=c*f;n[0]=p+v*l,n[4]=y*l-g,n[8]=o*c,n[1]=o*f,n[5]=o*h,n[9]=-l,n[2]=g*l-y,n[6]=v+p*l,n[10]=o*u}else if(e.order==="ZXY"){let p=u*h,g=u*f,y=c*h,v=c*f;n[0]=p-v*l,n[4]=-o*f,n[8]=y+g*l,n[1]=g+y*l,n[5]=o*h,n[9]=v-p*l,n[2]=-o*c,n[6]=l,n[10]=o*u}else if(e.order==="ZYX"){let p=o*h,g=o*f,y=l*h,v=l*f;n[0]=u*h,n[4]=y*c-g,n[8]=p*c+v,n[1]=u*f,n[5]=v*c+p,n[9]=g*c-y,n[2]=-c,n[6]=l*u,n[10]=o*u}else if(e.order==="YZX"){let p=o*u,g=o*c,y=l*u,v=l*c;n[0]=u*h,n[4]=v-p*f,n[8]=y*f+g,n[1]=f,n[5]=o*h,n[9]=-l*h,n[2]=-c*h,n[6]=g*f+y,n[10]=p-v*f}else if(e.order==="XZY"){let p=o*u,g=o*c,y=l*u,v=l*c;n[0]=u*h,n[4]=-f,n[8]=c*h,n[1]=p*f+v,n[5]=o*h,n[9]=g*f-y,n[2]=y*f-g,n[6]=l*h,n[10]=v*f+p}return n[3]=0,n[7]=0,n[11]=0,n[12]=0,n[13]=0,n[14]=0,n[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Ph,e,Ih)}lookAt(e,n,i){let s=this.elements;return Wt.subVectors(e,n),Wt.lengthSq()===0&&(Wt.z=1),Wt.normalize(),Bn.crossVectors(i,Wt),Bn.lengthSq()===0&&(Math.abs(i.z)===1?Wt.x+=1e-4:Wt.z+=1e-4,Wt.normalize(),Bn.crossVectors(i,Wt)),Bn.normalize(),_s.crossVectors(Wt,Bn),s[0]=Bn.x,s[4]=_s.x,s[8]=Wt.x,s[1]=Bn.y,s[5]=_s.y,s[9]=Wt.y,s[2]=Bn.z,s[6]=_s.z,s[10]=Wt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,n){let i=e.elements,s=n.elements,r=this.elements,o=i[0],l=i[4],u=i[8],c=i[12],h=i[1],f=i[5],p=i[9],g=i[13],y=i[2],v=i[6],m=i[10],d=i[14],T=i[3],_=i[7],x=i[11],A=i[15],E=s[0],C=s[4],P=s[8],M=s[12],w=s[1],I=s[5],D=s[9],z=s[13],H=s[2],j=s[6],W=s[10],ne=s[14],X=s[3],re=s[7],le=s[11],pe=s[15];return r[0]=o*E+l*w+u*H+c*X,r[4]=o*C+l*I+u*j+c*re,r[8]=o*P+l*D+u*W+c*le,r[12]=o*M+l*z+u*ne+c*pe,r[1]=h*E+f*w+p*H+g*X,r[5]=h*C+f*I+p*j+g*re,r[9]=h*P+f*D+p*W+g*le,r[13]=h*M+f*z+p*ne+g*pe,r[2]=y*E+v*w+m*H+d*X,r[6]=y*C+v*I+m*j+d*re,r[10]=y*P+v*D+m*W+d*le,r[14]=y*M+v*z+m*ne+d*pe,r[3]=T*E+_*w+x*H+A*X,r[7]=T*C+_*I+x*j+A*re,r[11]=T*P+_*D+x*W+A*le,r[15]=T*M+_*z+x*ne+A*pe,this}multiplyScalar(e){let n=this.elements;return n[0]*=e,n[4]*=e,n[8]*=e,n[12]*=e,n[1]*=e,n[5]*=e,n[9]*=e,n[13]*=e,n[2]*=e,n[6]*=e,n[10]*=e,n[14]*=e,n[3]*=e,n[7]*=e,n[11]*=e,n[15]*=e,this}determinant(){let e=this.elements,n=e[0],i=e[4],s=e[8],r=e[12],o=e[1],l=e[5],u=e[9],c=e[13],h=e[2],f=e[6],p=e[10],g=e[14],y=e[3],v=e[7],m=e[11],d=e[15];return y*(+r*u*f-s*c*f-r*l*p+i*c*p+s*l*g-i*u*g)+v*(+n*u*g-n*c*p+r*o*p-s*o*g+s*c*h-r*u*h)+m*(+n*c*f-n*l*g-r*o*f+i*o*g+r*l*h-i*c*h)+d*(-s*l*h-n*u*f+n*l*p+s*o*f-i*o*p+i*u*h)}transpose(){let e=this.elements,n;return n=e[1],e[1]=e[4],e[4]=n,n=e[2],e[2]=e[8],e[8]=n,n=e[6],e[6]=e[9],e[9]=n,n=e[3],e[3]=e[12],e[12]=n,n=e[7],e[7]=e[13],e[13]=n,n=e[11],e[11]=e[14],e[14]=n,this}setPosition(e,n,i){let s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=n,s[14]=i),this}invert(){let e=this.elements,n=e[0],i=e[1],s=e[2],r=e[3],o=e[4],l=e[5],u=e[6],c=e[7],h=e[8],f=e[9],p=e[10],g=e[11],y=e[12],v=e[13],m=e[14],d=e[15],T=f*m*c-v*p*c+v*u*g-l*m*g-f*u*d+l*p*d,_=y*p*c-h*m*c-y*u*g+o*m*g+h*u*d-o*p*d,x=h*v*c-y*f*c+y*l*g-o*v*g-h*l*d+o*f*d,A=y*f*u-h*v*u-y*l*p+o*v*p+h*l*m-o*f*m,E=n*T+i*_+s*x+r*A;if(E===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let C=1/E;return e[0]=T*C,e[1]=(v*p*r-f*m*r-v*s*g+i*m*g+f*s*d-i*p*d)*C,e[2]=(l*m*r-v*u*r+v*s*c-i*m*c-l*s*d+i*u*d)*C,e[3]=(f*u*r-l*p*r-f*s*c+i*p*c+l*s*g-i*u*g)*C,e[4]=_*C,e[5]=(h*m*r-y*p*r+y*s*g-n*m*g-h*s*d+n*p*d)*C,e[6]=(y*u*r-o*m*r-y*s*c+n*m*c+o*s*d-n*u*d)*C,e[7]=(o*p*r-h*u*r+h*s*c-n*p*c-o*s*g+n*u*g)*C,e[8]=x*C,e[9]=(y*f*r-h*v*r-y*i*g+n*v*g+h*i*d-n*f*d)*C,e[10]=(o*v*r-y*l*r+y*i*c-n*v*c-o*i*d+n*l*d)*C,e[11]=(h*l*r-o*f*r-h*i*c+n*f*c+o*i*g-n*l*g)*C,e[12]=A*C,e[13]=(h*v*s-y*f*s+y*i*p-n*v*p-h*i*m+n*f*m)*C,e[14]=(y*l*s-o*v*s-y*i*u+n*v*u+o*i*m-n*l*m)*C,e[15]=(o*f*s-h*l*s+h*i*u-n*f*u-o*i*p+n*l*p)*C,this}scale(e){let n=this.elements,i=e.x,s=e.y,r=e.z;return n[0]*=i,n[4]*=s,n[8]*=r,n[1]*=i,n[5]*=s,n[9]*=r,n[2]*=i,n[6]*=s,n[10]*=r,n[3]*=i,n[7]*=s,n[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,n=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(n,i,s))}makeTranslation(e,n,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,n,0,0,1,i,0,0,0,1),this}makeRotationX(e){let n=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,n,-i,0,0,i,n,0,0,0,0,1),this}makeRotationY(e){let n=Math.cos(e),i=Math.sin(e);return this.set(n,0,i,0,0,1,0,0,-i,0,n,0,0,0,0,1),this}makeRotationZ(e){let n=Math.cos(e),i=Math.sin(e);return this.set(n,-i,0,0,i,n,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,n){let i=Math.cos(n),s=Math.sin(n),r=1-i,o=e.x,l=e.y,u=e.z,c=r*o,h=r*l;return this.set(c*o+i,c*l-s*u,c*u+s*l,0,c*l+s*u,h*l+i,h*u-s*o,0,c*u-s*l,h*u+s*o,r*u*u+i,0,0,0,0,1),this}makeScale(e,n,i){return this.set(e,0,0,0,0,n,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,n,i,s,r,o){return this.set(1,i,r,0,e,1,o,0,n,s,1,0,0,0,0,1),this}compose(e,n,i){let s=this.elements,r=n._x,o=n._y,l=n._z,u=n._w,c=r+r,h=o+o,f=l+l,p=r*c,g=r*h,y=r*f,v=o*h,m=o*f,d=l*f,T=u*c,_=u*h,x=u*f,A=i.x,E=i.y,C=i.z;return s[0]=(1-(v+d))*A,s[1]=(g+x)*A,s[2]=(y-_)*A,s[3]=0,s[4]=(g-x)*E,s[5]=(1-(p+d))*E,s[6]=(m+T)*E,s[7]=0,s[8]=(y+_)*C,s[9]=(m-T)*C,s[10]=(1-(p+v))*C,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,n,i){let s=this.elements,r=Ii.set(s[0],s[1],s[2]).length(),o=Ii.set(s[4],s[5],s[6]).length(),l=Ii.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),e.x=s[12],e.y=s[13],e.z=s[14],an.copy(this);let c=1/r,h=1/o,f=1/l;return an.elements[0]*=c,an.elements[1]*=c,an.elements[2]*=c,an.elements[4]*=h,an.elements[5]*=h,an.elements[6]*=h,an.elements[8]*=f,an.elements[9]*=f,an.elements[10]*=f,n.setFromRotationMatrix(an),i.x=r,i.y=o,i.z=l,this}makePerspective(e,n,i,s,r,o,l=rn,u=!1){let c=this.elements,h=2*r/(n-e),f=2*r/(i-s),p=(n+e)/(n-e),g=(i+s)/(i-s),y,v;if(u)y=r/(o-r),v=o*r/(o-r);else if(l===rn)y=-(o+r)/(o-r),v=-2*o*r/(o-r);else if(l===Ca)y=-o/(o-r),v=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+l);return c[0]=h,c[4]=0,c[8]=p,c[12]=0,c[1]=0,c[5]=f,c[9]=g,c[13]=0,c[2]=0,c[6]=0,c[10]=y,c[14]=v,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,n,i,s,r,o,l=rn,u=!1){let c=this.elements,h=2/(n-e),f=2/(i-s),p=-(n+e)/(n-e),g=-(i+s)/(i-s),y,v;if(u)y=1/(o-r),v=o/(o-r);else if(l===rn)y=-2/(o-r),v=-(o+r)/(o-r);else if(l===Ca)y=-1/(o-r),v=-r/(o-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+l);return c[0]=h,c[4]=0,c[8]=0,c[12]=p,c[1]=0,c[5]=f,c[9]=0,c[13]=g,c[2]=0,c[6]=0,c[10]=y,c[14]=v,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let n=this.elements,i=e.elements;for(let s=0;s<16;s++)if(n[s]!==i[s])return!1;return!0}fromArray(e,n=0){for(let i=0;i<16;i++)this.elements[i]=e[i+n];return this}toArray(e=[],n=0){let i=this.elements;return e[n]=i[0],e[n+1]=i[1],e[n+2]=i[2],e[n+3]=i[3],e[n+4]=i[4],e[n+5]=i[5],e[n+6]=i[6],e[n+7]=i[7],e[n+8]=i[8],e[n+9]=i[9],e[n+10]=i[10],e[n+11]=i[11],e[n+12]=i[12],e[n+13]=i[13],e[n+14]=i[14],e[n+15]=i[15],e}},Ii=new U,an=new ot,Ph=new U(0,0,0),Ih=new U(1,1,1),Bn=new U,_s=new U,Wt=new U,mc=new ot,gc=new Pn,ln=class a{constructor(e=0,n=0,i=0,s=a.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=n,this._z=i,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,n,i,s=this._order){return this._x=e,this._y=n,this._z=i,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,n=this._order,i=!0){let s=e.elements,r=s[0],o=s[4],l=s[8],u=s[1],c=s[5],h=s[9],f=s[2],p=s[6],g=s[10];switch(n){case"XYZ":this._y=Math.asin(je(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,g),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(p,c),this._z=0);break;case"YXZ":this._x=Math.asin(-je(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(l,g),this._z=Math.atan2(u,c)):(this._y=Math.atan2(-f,r),this._z=0);break;case"ZXY":this._x=Math.asin(je(p,-1,1)),Math.abs(p)<.9999999?(this._y=Math.atan2(-f,g),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(u,r));break;case"ZYX":this._y=Math.asin(-je(f,-1,1)),Math.abs(f)<.9999999?(this._x=Math.atan2(p,g),this._z=Math.atan2(u,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(je(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-f,r)):(this._x=0,this._y=Math.atan2(l,g));break;case"XZY":this._z=Math.asin(-je(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(p,c),this._y=Math.atan2(l,r)):(this._x=Math.atan2(-h,g),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+n)}return this._order=n,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,n,i){return mc.makeRotationFromQuaternion(e),this.setFromRotationMatrix(mc,n,i)}setFromVector3(e,n=this._order){return this.set(e.x,e.y,e.z,n)}reorder(e){return gc.setFromEuler(this),this.setFromQuaternion(gc,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],n=0){return e[n]=this._x,e[n+1]=this._y,e[n+2]=this._z,e[n+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};ln.DEFAULT_ORDER="XYZ";var $i=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},Lh=0,yc=new U,Li=new Pn,Tn=new ot,bs=new U,va=new U,Dh=new U,Uh=new Pn,xc=new U(1,0,0),_c=new U(0,1,0),bc=new U(0,0,1),vc={type:"added"},Nh={type:"removed"},Di={type:"childadded",child:null},Bo={type:"childremoved",child:null},At=class a extends Rn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Lh++}),this.uuid=Vn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=a.DEFAULT_UP.clone();let e=new U,n=new ln,i=new Pn,s=new U(1,1,1);function r(){i.setFromEuler(n,!1)}function o(){n.setFromQuaternion(i,void 0,!1)}n._onChange(r),i._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new ot},normalMatrix:{value:new ze}}),this.matrix=new ot,this.matrixWorld=new ot,this.matrixAutoUpdate=a.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=a.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new $i,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,n){this.quaternion.setFromAxisAngle(e,n)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,n){return Li.setFromAxisAngle(e,n),this.quaternion.multiply(Li),this}rotateOnWorldAxis(e,n){return Li.setFromAxisAngle(e,n),this.quaternion.premultiply(Li),this}rotateX(e){return this.rotateOnAxis(xc,e)}rotateY(e){return this.rotateOnAxis(_c,e)}rotateZ(e){return this.rotateOnAxis(bc,e)}translateOnAxis(e,n){return yc.copy(e).applyQuaternion(this.quaternion),this.position.add(yc.multiplyScalar(n)),this}translateX(e){return this.translateOnAxis(xc,e)}translateY(e){return this.translateOnAxis(_c,e)}translateZ(e){return this.translateOnAxis(bc,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Tn.copy(this.matrixWorld).invert())}lookAt(e,n,i){e.isVector3?bs.copy(e):bs.set(e,n,i);let s=this.parent;this.updateWorldMatrix(!0,!1),va.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Tn.lookAt(va,bs,this.up):Tn.lookAt(bs,va,this.up),this.quaternion.setFromRotationMatrix(Tn),s&&(Tn.extractRotation(s.matrixWorld),Li.setFromRotationMatrix(Tn),this.quaternion.premultiply(Li.invert()))}add(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.add(arguments[n]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(vc),Di.child=e,this.dispatchEvent(Di),Di.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}let n=this.children.indexOf(e);return n!==-1&&(e.parent=null,this.children.splice(n,1),e.dispatchEvent(Nh),Bo.child=e,this.dispatchEvent(Bo),Bo.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Tn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Tn.multiply(e.parent.matrixWorld)),e.applyMatrix4(Tn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(vc),Di.child=e,this.dispatchEvent(Di),Di.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,n){if(this[e]===n)return this;for(let i=0,s=this.children.length;i<s;i++){let o=this.children[i].getObjectByProperty(e,n);if(o!==void 0)return o}}getObjectsByProperty(e,n,i=[]){this[e]===n&&i.push(this);let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(e,n,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(va,e,Dh),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(va,Uh,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let n=this.matrixWorld.elements;return e.set(n[8],n[9],n[10]).normalize()}raycast(){}traverse(e){e(this);let n=this.children;for(let i=0,s=n.length;i<s;i++)n[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let n=this.children;for(let i=0,s=n.length;i<s;i++)n[i].traverseVisible(e)}traverseAncestors(e){let n=this.parent;n!==null&&(e(n),n.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let n=this.children;for(let i=0,s=n.length;i<s;i++)n[i].updateMatrixWorld(e)}updateWorldMatrix(e,n){let i=this.parent;if(e===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),n===!0){let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(e){let n=e===void 0||typeof e=="string",i={};n&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(l=>({...l,boundingBox:l.boundingBox?l.boundingBox.toJSON():void 0,boundingSphere:l.boundingSphere?l.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(l=>({...l})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(l,u){return l[u.uuid]===void 0&&(l[u.uuid]=u.toJSON(e)),u.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);let l=this.geometry.parameters;if(l!==void 0&&l.shapes!==void 0){let u=l.shapes;if(Array.isArray(u))for(let c=0,h=u.length;c<h;c++){let f=u[c];r(e.shapes,f)}else r(e.shapes,u)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let l=[];for(let u=0,c=this.material.length;u<c;u++)l.push(r(e.materials,this.material[u]));s.material=l}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let l=0;l<this.children.length;l++)s.children.push(this.children[l].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let l=0;l<this.animations.length;l++){let u=this.animations[l];s.animations.push(r(e.animations,u))}}if(n){let l=o(e.geometries),u=o(e.materials),c=o(e.textures),h=o(e.images),f=o(e.shapes),p=o(e.skeletons),g=o(e.animations),y=o(e.nodes);l.length>0&&(i.geometries=l),u.length>0&&(i.materials=u),c.length>0&&(i.textures=c),h.length>0&&(i.images=h),f.length>0&&(i.shapes=f),p.length>0&&(i.skeletons=p),g.length>0&&(i.animations=g),y.length>0&&(i.nodes=y)}return i.object=s,i;function o(l){let u=[];for(let c in l){let h=l[c];delete h.metadata,u.push(h)}return u}}clone(e){return new this.constructor().copy(this,e)}copy(e,n=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),n===!0)for(let i=0;i<e.children.length;i++){let s=e.children[i];this.add(s.clone())}return this}};At.DEFAULT_UP=new U(0,1,0);At.DEFAULT_MATRIX_AUTO_UPDATE=!0;At.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var sn=new U,En=new U,Oo=new U,An=new U,Ui=new U,Ni=new U,Mc=new U,zo=new U,Ho=new U,Vo=new U,Go=new gt,Wo=new gt,Xo=new gt,pn=class a{constructor(e=new U,n=new U,i=new U){this.a=e,this.b=n,this.c=i}static getNormal(e,n,i,s){s.subVectors(i,n),sn.subVectors(e,n),s.cross(sn);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,n,i,s,r){sn.subVectors(s,n),En.subVectors(i,n),Oo.subVectors(e,n);let o=sn.dot(sn),l=sn.dot(En),u=sn.dot(Oo),c=En.dot(En),h=En.dot(Oo),f=o*c-l*l;if(f===0)return r.set(0,0,0),null;let p=1/f,g=(c*u-l*h)*p,y=(o*h-l*u)*p;return r.set(1-g-y,y,g)}static containsPoint(e,n,i,s){return this.getBarycoord(e,n,i,s,An)===null?!1:An.x>=0&&An.y>=0&&An.x+An.y<=1}static getInterpolation(e,n,i,s,r,o,l,u){return this.getBarycoord(e,n,i,s,An)===null?(u.x=0,u.y=0,"z"in u&&(u.z=0),"w"in u&&(u.w=0),null):(u.setScalar(0),u.addScaledVector(r,An.x),u.addScaledVector(o,An.y),u.addScaledVector(l,An.z),u)}static getInterpolatedAttribute(e,n,i,s,r,o){return Go.setScalar(0),Wo.setScalar(0),Xo.setScalar(0),Go.fromBufferAttribute(e,n),Wo.fromBufferAttribute(e,i),Xo.fromBufferAttribute(e,s),o.setScalar(0),o.addScaledVector(Go,r.x),o.addScaledVector(Wo,r.y),o.addScaledVector(Xo,r.z),o}static isFrontFacing(e,n,i,s){return sn.subVectors(i,n),En.subVectors(e,n),sn.cross(En).dot(s)<0}set(e,n,i){return this.a.copy(e),this.b.copy(n),this.c.copy(i),this}setFromPointsAndIndices(e,n,i,s){return this.a.copy(e[n]),this.b.copy(e[i]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,n,i,s){return this.a.fromBufferAttribute(e,n),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return sn.subVectors(this.c,this.b),En.subVectors(this.a,this.b),sn.cross(En).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return a.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,n){return a.getBarycoord(e,this.a,this.b,this.c,n)}getInterpolation(e,n,i,s,r){return a.getInterpolation(e,this.a,this.b,this.c,n,i,s,r)}containsPoint(e){return a.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return a.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,n){let i=this.a,s=this.b,r=this.c,o,l;Ui.subVectors(s,i),Ni.subVectors(r,i),zo.subVectors(e,i);let u=Ui.dot(zo),c=Ni.dot(zo);if(u<=0&&c<=0)return n.copy(i);Ho.subVectors(e,s);let h=Ui.dot(Ho),f=Ni.dot(Ho);if(h>=0&&f<=h)return n.copy(s);let p=u*f-h*c;if(p<=0&&u>=0&&h<=0)return o=u/(u-h),n.copy(i).addScaledVector(Ui,o);Vo.subVectors(e,r);let g=Ui.dot(Vo),y=Ni.dot(Vo);if(y>=0&&g<=y)return n.copy(r);let v=g*c-u*y;if(v<=0&&c>=0&&y<=0)return l=c/(c-y),n.copy(i).addScaledVector(Ni,l);let m=h*y-g*f;if(m<=0&&f-h>=0&&g-y>=0)return Mc.subVectors(r,s),l=(f-h)/(f-h+(g-y)),n.copy(s).addScaledVector(Mc,l);let d=1/(m+v+p);return o=v*d,l=p*d,n.copy(i).addScaledVector(Ui,o).addScaledVector(Ni,l)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},Tu={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},On={h:0,s:0,l:0},vs={h:0,s:0,l:0};function qo(a,e,n){return n<0&&(n+=1),n>1&&(n-=1),n<1/6?a+(e-a)*6*n:n<1/2?e:n<2/3?a+(e-a)*6*(2/3-n):a}var Oe=class{constructor(e,n,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,n,i)}set(e,n,i){if(n===void 0&&i===void 0){let s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,n,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,n=Et){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Ye.colorSpaceToWorking(this,n),this}setRGB(e,n,i,s=Ye.workingColorSpace){return this.r=e,this.g=n,this.b=i,Ye.colorSpaceToWorking(this,s),this}setHSL(e,n,i,s=Ye.workingColorSpace){if(e=Eh(e,1),n=je(n,0,1),i=je(i,0,1),n===0)this.r=this.g=this.b=i;else{let r=i<=.5?i*(1+n):i+n-i*n,o=2*i-r;this.r=qo(o,r,e+1/3),this.g=qo(o,r,e),this.b=qo(o,r,e-1/3)}return Ye.colorSpaceToWorking(this,s),this}setStyle(e,n=Et){function i(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r,o=s[1],l=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(l))return i(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,n);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(l))return i(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,n);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(l))return i(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,n);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){let r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,n);if(o===6)return this.setHex(parseInt(r,16),n);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,n);return this}setColorName(e,n=Et){let i=Tu[e.toLowerCase()];return i!==void 0?this.setHex(i,n):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=kn(e.r),this.g=kn(e.g),this.b=kn(e.b),this}copyLinearToSRGB(e){return this.r=Wi(e.r),this.g=Wi(e.g),this.b=Wi(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Et){return Ye.workingToColorSpace(Rt.copy(this),e),Math.round(je(Rt.r*255,0,255))*65536+Math.round(je(Rt.g*255,0,255))*256+Math.round(je(Rt.b*255,0,255))}getHexString(e=Et){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,n=Ye.workingColorSpace){Ye.workingToColorSpace(Rt.copy(this),n);let i=Rt.r,s=Rt.g,r=Rt.b,o=Math.max(i,s,r),l=Math.min(i,s,r),u,c,h=(l+o)/2;if(l===o)u=0,c=0;else{let f=o-l;switch(c=h<=.5?f/(o+l):f/(2-o-l),o){case i:u=(s-r)/f+(s<r?6:0);break;case s:u=(r-i)/f+2;break;case r:u=(i-s)/f+4;break}u/=6}return e.h=u,e.s=c,e.l=h,e}getRGB(e,n=Ye.workingColorSpace){return Ye.workingToColorSpace(Rt.copy(this),n),e.r=Rt.r,e.g=Rt.g,e.b=Rt.b,e}getStyle(e=Et){Ye.workingToColorSpace(Rt.copy(this),e);let n=Rt.r,i=Rt.g,s=Rt.b;return e!==Et?`color(${e} ${n.toFixed(3)} ${i.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(n*255)},${Math.round(i*255)},${Math.round(s*255)})`}offsetHSL(e,n,i){return this.getHSL(On),this.setHSL(On.h+e,On.s+n,On.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,n){return this.r=e.r+n.r,this.g=e.g+n.g,this.b=e.b+n.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,n){return this.r+=(e.r-this.r)*n,this.g+=(e.g-this.g)*n,this.b+=(e.b-this.b)*n,this}lerpColors(e,n,i){return this.r=e.r+(n.r-e.r)*i,this.g=e.g+(n.g-e.g)*i,this.b=e.b+(n.b-e.b)*i,this}lerpHSL(e,n){this.getHSL(On),e.getHSL(vs);let i=ko(On.h,vs.h,n),s=ko(On.s,vs.s,n),r=ko(On.l,vs.l,n);return this.setHSL(i,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let n=this.r,i=this.g,s=this.b,r=e.elements;return this.r=r[0]*n+r[3]*i+r[6]*s,this.g=r[1]*n+r[4]*i+r[7]*s,this.b=r[2]*n+r[5]*i+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,n=0){return this.r=e[n],this.g=e[n+1],this.b=e[n+2],this}toArray(e=[],n=0){return e[n]=this.r,e[n+1]=this.g,e[n+2]=this.b,e}fromBufferAttribute(e,n){return this.r=e.getX(n),this.g=e.getY(n),this.b=e.getZ(n),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Rt=new Oe;Oe.NAMES=Tu;var Fh=0,gn=class extends Rn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Fh++}),this.uuid=Vn(),this.name="",this.type="Material",this.blending=li,this.side=Cn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Vs,this.blendDst=Gs,this.blendEquation=Gn,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Oe(0,0,0),this.blendAlpha=0,this.depthFunc=ci,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=il,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=oi,this.stencilZFail=oi,this.stencilZPass=oi,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let n in e){let i=e[n];if(i===void 0){console.warn(`THREE.Material: parameter '${n}' has value of undefined.`);continue}let s=this[n];if(s===void 0){console.warn(`THREE.Material: '${n}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(i):s&&s.isVector3&&i&&i.isVector3?s.copy(i):this[n]=i}}toJSON(e){let n=e===void 0||typeof e=="string";n&&(e={textures:{},images:{}});let i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==li&&(i.blending=this.blending),this.side!==Cn&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==Vs&&(i.blendSrc=this.blendSrc),this.blendDst!==Gs&&(i.blendDst=this.blendDst),this.blendEquation!==Gn&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==ci&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==il&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==oi&&(i.stencilFail=this.stencilFail),this.stencilZFail!==oi&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==oi&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function s(r){let o=[];for(let l in r){let u=r[l];delete u.metadata,o.push(u)}return o}if(n){let r=s(e.textures),o=s(e.images);r.length>0&&(i.textures=r),o.length>0&&(i.images=o)}return i}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let n=e.clippingPlanes,i=null;if(n!==null){let s=n.length;i=new Array(s);for(let r=0;r!==s;++r)i[r]=n[r].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}},Xn=class extends gn{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Oe(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ln,this.combine=fl,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}};var bt=new U,Ms=new Be,Bh=0,It=class{constructor(e,n,i=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Bh++}),this.name="",this.array=e,this.itemSize=n,this.count=e!==void 0?e.length/n:0,this.normalized=i,this.usage=js,this.updateRanges=[],this.gpuType=xn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,n){this.updateRanges.push({start:e,count:n})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,n,i){e*=this.itemSize,i*=n.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=n.array[i+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let n=0,i=this.count;n<i;n++)Ms.fromBufferAttribute(this,n),Ms.applyMatrix3(e),this.setXY(n,Ms.x,Ms.y);else if(this.itemSize===3)for(let n=0,i=this.count;n<i;n++)bt.fromBufferAttribute(this,n),bt.applyMatrix3(e),this.setXYZ(n,bt.x,bt.y,bt.z);return this}applyMatrix4(e){for(let n=0,i=this.count;n<i;n++)bt.fromBufferAttribute(this,n),bt.applyMatrix4(e),this.setXYZ(n,bt.x,bt.y,bt.z);return this}applyNormalMatrix(e){for(let n=0,i=this.count;n<i;n++)bt.fromBufferAttribute(this,n),bt.applyNormalMatrix(e),this.setXYZ(n,bt.x,bt.y,bt.z);return this}transformDirection(e){for(let n=0,i=this.count;n<i;n++)bt.fromBufferAttribute(this,n),bt.transformDirection(e),this.setXYZ(n,bt.x,bt.y,bt.z);return this}set(e,n=0){return this.array.set(e,n),this}getComponent(e,n){let i=this.array[e*this.itemSize+n];return this.normalized&&(i=fn(i,this.array)),i}setComponent(e,n,i){return this.normalized&&(i=at(i,this.array)),this.array[e*this.itemSize+n]=i,this}getX(e){let n=this.array[e*this.itemSize];return this.normalized&&(n=fn(n,this.array)),n}setX(e,n){return this.normalized&&(n=at(n,this.array)),this.array[e*this.itemSize]=n,this}getY(e){let n=this.array[e*this.itemSize+1];return this.normalized&&(n=fn(n,this.array)),n}setY(e,n){return this.normalized&&(n=at(n,this.array)),this.array[e*this.itemSize+1]=n,this}getZ(e){let n=this.array[e*this.itemSize+2];return this.normalized&&(n=fn(n,this.array)),n}setZ(e,n){return this.normalized&&(n=at(n,this.array)),this.array[e*this.itemSize+2]=n,this}getW(e){let n=this.array[e*this.itemSize+3];return this.normalized&&(n=fn(n,this.array)),n}setW(e,n){return this.normalized&&(n=at(n,this.array)),this.array[e*this.itemSize+3]=n,this}setXY(e,n,i){return e*=this.itemSize,this.normalized&&(n=at(n,this.array),i=at(i,this.array)),this.array[e+0]=n,this.array[e+1]=i,this}setXYZ(e,n,i,s){return e*=this.itemSize,this.normalized&&(n=at(n,this.array),i=at(i,this.array),s=at(s,this.array)),this.array[e+0]=n,this.array[e+1]=i,this.array[e+2]=s,this}setXYZW(e,n,i,s,r){return e*=this.itemSize,this.normalized&&(n=at(n,this.array),i=at(i,this.array),s=at(s,this.array),r=at(r,this.array)),this.array[e+0]=n,this.array[e+1]=i,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==js&&(e.usage=this.usage),e}};var Ia=class extends It{constructor(e,n,i){super(new Uint16Array(e),n,i)}};var La=class extends It{constructor(e,n,i){super(new Uint32Array(e),n,i)}};var vt=class extends It{constructor(e,n,i){super(new Float32Array(e),n,i)}},Oh=0,Jt=new ot,jo=new At,Fi=new U,Xt=new Wn,Ma=new Wn,Tt=new U,Ft=class a extends Rn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Oh++}),this.uuid=Vn(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(El(e)?La:Ia)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,n){return this.attributes[e]=n,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,n,i=0){this.groups.push({start:e,count:n,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,n){this.drawRange.start=e,this.drawRange.count=n}applyMatrix4(e){let n=this.attributes.position;n!==void 0&&(n.applyMatrix4(e),n.needsUpdate=!0);let i=this.attributes.normal;if(i!==void 0){let r=new ze().getNormalMatrix(e);i.applyNormalMatrix(r),i.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Jt.makeRotationFromQuaternion(e),this.applyMatrix4(Jt),this}rotateX(e){return Jt.makeRotationX(e),this.applyMatrix4(Jt),this}rotateY(e){return Jt.makeRotationY(e),this.applyMatrix4(Jt),this}rotateZ(e){return Jt.makeRotationZ(e),this.applyMatrix4(Jt),this}translate(e,n,i){return Jt.makeTranslation(e,n,i),this.applyMatrix4(Jt),this}scale(e,n,i){return Jt.makeScale(e,n,i),this.applyMatrix4(Jt),this}lookAt(e){return jo.lookAt(e),jo.updateMatrix(),this.applyMatrix4(jo.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Fi).negate(),this.translate(Fi.x,Fi.y,Fi.z),this}setFromPoints(e){let n=this.getAttribute("position");if(n===void 0){let i=[];for(let s=0,r=e.length;s<r;s++){let o=e[s];i.push(o.x,o.y,o.z||0)}this.setAttribute("position",new vt(i,3))}else{let i=Math.min(e.length,n.count);for(let s=0;s<i;s++){let r=e[s];n.setXYZ(s,r.x,r.y,r.z||0)}e.length>n.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),n.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Wn);let e=this.attributes.position,n=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new U(-1/0,-1/0,-1/0),new U(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),n)for(let i=0,s=n.length;i<s;i++){let r=n[i];Xt.setFromBufferAttribute(r),this.morphTargetsRelative?(Tt.addVectors(this.boundingBox.min,Xt.min),this.boundingBox.expandByPoint(Tt),Tt.addVectors(this.boundingBox.max,Xt.max),this.boundingBox.expandByPoint(Tt)):(this.boundingBox.expandByPoint(Xt.min),this.boundingBox.expandByPoint(Xt.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new hi);let e=this.attributes.position,n=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new U,1/0);return}if(e){let i=this.boundingSphere.center;if(Xt.setFromBufferAttribute(e),n)for(let r=0,o=n.length;r<o;r++){let l=n[r];Ma.setFromBufferAttribute(l),this.morphTargetsRelative?(Tt.addVectors(Xt.min,Ma.min),Xt.expandByPoint(Tt),Tt.addVectors(Xt.max,Ma.max),Xt.expandByPoint(Tt)):(Xt.expandByPoint(Ma.min),Xt.expandByPoint(Ma.max))}Xt.getCenter(i);let s=0;for(let r=0,o=e.count;r<o;r++)Tt.fromBufferAttribute(e,r),s=Math.max(s,i.distanceToSquared(Tt));if(n)for(let r=0,o=n.length;r<o;r++){let l=n[r],u=this.morphTargetsRelative;for(let c=0,h=l.count;c<h;c++)Tt.fromBufferAttribute(l,c),u&&(Fi.fromBufferAttribute(e,c),Tt.add(Fi)),s=Math.max(s,i.distanceToSquared(Tt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,n=this.attributes;if(e===null||n.position===void 0||n.normal===void 0||n.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let i=n.position,s=n.normal,r=n.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new It(new Float32Array(4*i.count),4));let o=this.getAttribute("tangent"),l=[],u=[];for(let P=0;P<i.count;P++)l[P]=new U,u[P]=new U;let c=new U,h=new U,f=new U,p=new Be,g=new Be,y=new Be,v=new U,m=new U;function d(P,M,w){c.fromBufferAttribute(i,P),h.fromBufferAttribute(i,M),f.fromBufferAttribute(i,w),p.fromBufferAttribute(r,P),g.fromBufferAttribute(r,M),y.fromBufferAttribute(r,w),h.sub(c),f.sub(c),g.sub(p),y.sub(p);let I=1/(g.x*y.y-y.x*g.y);isFinite(I)&&(v.copy(h).multiplyScalar(y.y).addScaledVector(f,-g.y).multiplyScalar(I),m.copy(f).multiplyScalar(g.x).addScaledVector(h,-y.x).multiplyScalar(I),l[P].add(v),l[M].add(v),l[w].add(v),u[P].add(m),u[M].add(m),u[w].add(m))}let T=this.groups;T.length===0&&(T=[{start:0,count:e.count}]);for(let P=0,M=T.length;P<M;++P){let w=T[P],I=w.start,D=w.count;for(let z=I,H=I+D;z<H;z+=3)d(e.getX(z+0),e.getX(z+1),e.getX(z+2))}let _=new U,x=new U,A=new U,E=new U;function C(P){A.fromBufferAttribute(s,P),E.copy(A);let M=l[P];_.copy(M),_.sub(A.multiplyScalar(A.dot(M))).normalize(),x.crossVectors(E,M);let I=x.dot(u[P])<0?-1:1;o.setXYZW(P,_.x,_.y,_.z,I)}for(let P=0,M=T.length;P<M;++P){let w=T[P],I=w.start,D=w.count;for(let z=I,H=I+D;z<H;z+=3)C(e.getX(z+0)),C(e.getX(z+1)),C(e.getX(z+2))}}computeVertexNormals(){let e=this.index,n=this.getAttribute("position");if(n!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new It(new Float32Array(n.count*3),3),this.setAttribute("normal",i);else for(let p=0,g=i.count;p<g;p++)i.setXYZ(p,0,0,0);let s=new U,r=new U,o=new U,l=new U,u=new U,c=new U,h=new U,f=new U;if(e)for(let p=0,g=e.count;p<g;p+=3){let y=e.getX(p+0),v=e.getX(p+1),m=e.getX(p+2);s.fromBufferAttribute(n,y),r.fromBufferAttribute(n,v),o.fromBufferAttribute(n,m),h.subVectors(o,r),f.subVectors(s,r),h.cross(f),l.fromBufferAttribute(i,y),u.fromBufferAttribute(i,v),c.fromBufferAttribute(i,m),l.add(h),u.add(h),c.add(h),i.setXYZ(y,l.x,l.y,l.z),i.setXYZ(v,u.x,u.y,u.z),i.setXYZ(m,c.x,c.y,c.z)}else for(let p=0,g=n.count;p<g;p+=3)s.fromBufferAttribute(n,p+0),r.fromBufferAttribute(n,p+1),o.fromBufferAttribute(n,p+2),h.subVectors(o,r),f.subVectors(s,r),h.cross(f),i.setXYZ(p+0,h.x,h.y,h.z),i.setXYZ(p+1,h.x,h.y,h.z),i.setXYZ(p+2,h.x,h.y,h.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let n=0,i=e.count;n<i;n++)Tt.fromBufferAttribute(e,n),Tt.normalize(),e.setXYZ(n,Tt.x,Tt.y,Tt.z)}toNonIndexed(){function e(l,u){let c=l.array,h=l.itemSize,f=l.normalized,p=new c.constructor(u.length*h),g=0,y=0;for(let v=0,m=u.length;v<m;v++){l.isInterleavedBufferAttribute?g=u[v]*l.data.stride+l.offset:g=u[v]*h;for(let d=0;d<h;d++)p[y++]=c[g++]}return new It(p,h,f)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let n=new a,i=this.index.array,s=this.attributes;for(let l in s){let u=s[l],c=e(u,i);n.setAttribute(l,c)}let r=this.morphAttributes;for(let l in r){let u=[],c=r[l];for(let h=0,f=c.length;h<f;h++){let p=c[h],g=e(p,i);u.push(g)}n.morphAttributes[l]=u}n.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let l=0,u=o.length;l<u;l++){let c=o[l];n.addGroup(c.start,c.count,c.materialIndex)}return n}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let u=this.parameters;for(let c in u)u[c]!==void 0&&(e[c]=u[c]);return e}e.data={attributes:{}};let n=this.index;n!==null&&(e.data.index={type:n.array.constructor.name,array:Array.prototype.slice.call(n.array)});let i=this.attributes;for(let u in i){let c=i[u];e.data.attributes[u]=c.toJSON(e.data)}let s={},r=!1;for(let u in this.morphAttributes){let c=this.morphAttributes[u],h=[];for(let f=0,p=c.length;f<p;f++){let g=c[f];h.push(g.toJSON(e.data))}h.length>0&&(s[u]=h,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));let l=this.boundingSphere;return l!==null&&(e.data.boundingSphere=l.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let n={};this.name=e.name;let i=e.index;i!==null&&this.setIndex(i.clone());let s=e.attributes;for(let c in s){let h=s[c];this.setAttribute(c,h.clone(n))}let r=e.morphAttributes;for(let c in r){let h=[],f=r[c];for(let p=0,g=f.length;p<g;p++)h.push(f[p].clone(n));this.morphAttributes[c]=h}this.morphTargetsRelative=e.morphTargetsRelative;let o=e.groups;for(let c=0,h=o.length;c<h;c++){let f=o[c];this.addGroup(f.start,f.count,f.materialIndex)}let l=e.boundingBox;l!==null&&(this.boundingBox=l.clone());let u=e.boundingSphere;return u!==null&&(this.boundingSphere=u.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},Sc=new ot,si=new Yi,Ss=new hi,wc=new U,ws=new U,Ts=new U,Es=new U,Yo=new U,As=new U,Tc=new U,ks=new U,yt=class extends At{constructor(e=new Ft,n=new Xn){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=n,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,n){return super.copy(e,n),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let n=this.geometry.morphAttributes,i=Object.keys(n);if(i.length>0){let s=n[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let l=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[l]=r}}}}getVertexPosition(e,n){let i=this.geometry,s=i.attributes.position,r=i.morphAttributes.position,o=i.morphTargetsRelative;n.fromBufferAttribute(s,e);let l=this.morphTargetInfluences;if(r&&l){As.set(0,0,0);for(let u=0,c=r.length;u<c;u++){let h=l[u],f=r[u];h!==0&&(Yo.fromBufferAttribute(f,e),o?As.addScaledVector(Yo,h):As.addScaledVector(Yo.sub(n),h))}n.add(As)}return n}raycast(e,n){let i=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),Ss.copy(i.boundingSphere),Ss.applyMatrix4(r),si.copy(e.ray).recast(e.near),!(Ss.containsPoint(si.origin)===!1&&(si.intersectSphere(Ss,wc)===null||si.origin.distanceToSquared(wc)>(e.far-e.near)**2))&&(Sc.copy(r).invert(),si.copy(e.ray).applyMatrix4(Sc),!(i.boundingBox!==null&&si.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,n,si)))}_computeIntersections(e,n,i){let s,r=this.geometry,o=this.material,l=r.index,u=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,f=r.attributes.normal,p=r.groups,g=r.drawRange;if(l!==null)if(Array.isArray(o))for(let y=0,v=p.length;y<v;y++){let m=p[y],d=o[m.materialIndex],T=Math.max(m.start,g.start),_=Math.min(l.count,Math.min(m.start+m.count,g.start+g.count));for(let x=T,A=_;x<A;x+=3){let E=l.getX(x),C=l.getX(x+1),P=l.getX(x+2);s=Cs(this,d,e,i,c,h,f,E,C,P),s&&(s.faceIndex=Math.floor(x/3),s.face.materialIndex=m.materialIndex,n.push(s))}}else{let y=Math.max(0,g.start),v=Math.min(l.count,g.start+g.count);for(let m=y,d=v;m<d;m+=3){let T=l.getX(m),_=l.getX(m+1),x=l.getX(m+2);s=Cs(this,o,e,i,c,h,f,T,_,x),s&&(s.faceIndex=Math.floor(m/3),n.push(s))}}else if(u!==void 0)if(Array.isArray(o))for(let y=0,v=p.length;y<v;y++){let m=p[y],d=o[m.materialIndex],T=Math.max(m.start,g.start),_=Math.min(u.count,Math.min(m.start+m.count,g.start+g.count));for(let x=T,A=_;x<A;x+=3){let E=x,C=x+1,P=x+2;s=Cs(this,d,e,i,c,h,f,E,C,P),s&&(s.faceIndex=Math.floor(x/3),s.face.materialIndex=m.materialIndex,n.push(s))}}else{let y=Math.max(0,g.start),v=Math.min(u.count,g.start+g.count);for(let m=y,d=v;m<d;m+=3){let T=m,_=m+1,x=m+2;s=Cs(this,o,e,i,c,h,f,T,_,x),s&&(s.faceIndex=Math.floor(m/3),n.push(s))}}}};function zh(a,e,n,i,s,r,o,l){let u;if(e.side===Bt?u=i.intersectTriangle(o,r,s,!0,l):u=i.intersectTriangle(s,r,o,e.side===Cn,l),u===null)return null;ks.copy(l),ks.applyMatrix4(a.matrixWorld);let c=n.ray.origin.distanceTo(ks);return c<n.near||c>n.far?null:{distance:c,point:ks.clone(),object:a}}function Cs(a,e,n,i,s,r,o,l,u,c){a.getVertexPosition(l,ws),a.getVertexPosition(u,Ts),a.getVertexPosition(c,Es);let h=zh(a,e,n,i,ws,Ts,Es,Tc);if(h){let f=new U;pn.getBarycoord(Tc,ws,Ts,Es,f),s&&(h.uv=pn.getInterpolatedAttribute(s,l,u,c,f,new Be)),r&&(h.uv1=pn.getInterpolatedAttribute(r,l,u,c,f,new Be)),o&&(h.normal=pn.getInterpolatedAttribute(o,l,u,c,f,new U),h.normal.dot(i.direction)>0&&h.normal.multiplyScalar(-1));let p={a:l,b:u,c,normal:new U,materialIndex:0};pn.getNormal(ws,Ts,Es,p.normal),h.face=p,h.barycoord=f}return h}var Lt=class a extends Ft{constructor(e=1,n=1,i=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:n,depth:i,widthSegments:s,heightSegments:r,depthSegments:o};let l=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);let u=[],c=[],h=[],f=[],p=0,g=0;y("z","y","x",-1,-1,i,n,e,o,r,0),y("z","y","x",1,-1,i,n,-e,o,r,1),y("x","z","y",1,1,e,i,n,s,o,2),y("x","z","y",1,-1,e,i,-n,s,o,3),y("x","y","z",1,-1,e,n,i,s,r,4),y("x","y","z",-1,-1,e,n,-i,s,r,5),this.setIndex(u),this.setAttribute("position",new vt(c,3)),this.setAttribute("normal",new vt(h,3)),this.setAttribute("uv",new vt(f,2));function y(v,m,d,T,_,x,A,E,C,P,M){let w=x/C,I=A/P,D=x/2,z=A/2,H=E/2,j=C+1,W=P+1,ne=0,X=0,re=new U;for(let le=0;le<W;le++){let pe=le*I-z;for(let Le=0;Le<j;Le++){let et=Le*w-D;re[v]=et*T,re[m]=pe*_,re[d]=H,c.push(re.x,re.y,re.z),re[v]=0,re[m]=0,re[d]=E>0?1:-1,h.push(re.x,re.y,re.z),f.push(Le/C),f.push(1-le/P),ne+=1}}for(let le=0;le<P;le++)for(let pe=0;pe<C;pe++){let Le=p+pe+j*le,et=p+pe+j*(le+1),st=p+(pe+1)+j*(le+1),qe=p+(pe+1)+j*le;u.push(Le,et,qe),u.push(et,st,qe),X+=6}l.addGroup(g,X,M),g+=X,p+=ne}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new a(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};function xi(a){let e={};for(let n in a){e[n]={};for(let i in a[n]){let s=a[n][i];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[n][i]=null):e[n][i]=s.clone():Array.isArray(s)?e[n][i]=s.slice():e[n][i]=s}}return e}function Dt(a){let e={};for(let n=0;n<a.length;n++){let i=xi(a[n]);for(let s in i)e[s]=i[s]}return e}function Hh(a){let e=[];for(let n=0;n<a.length;n++)e.push(a[n].clone());return e}function Al(a){let e=a.getRenderTarget();return e===null?a.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Ye.workingColorSpace}var Eu={clone:xi,merge:Dt},Vh=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Gh=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,cn=class extends gn{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Vh,this.fragmentShader=Gh,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=xi(e.uniforms),this.uniformsGroups=Hh(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){let n=super.toJSON(e);n.glslVersion=this.glslVersion,n.uniforms={};for(let s in this.uniforms){let o=this.uniforms[s].value;o&&o.isTexture?n.uniforms[s]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?n.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?n.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?n.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?n.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?n.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?n.uniforms[s]={type:"m4",value:o.toArray()}:n.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(n.defines=this.defines),n.vertexShader=this.vertexShader,n.fragmentShader=this.fragmentShader,n.lights=this.lights,n.clipping=this.clipping;let i={};for(let s in this.extensions)this.extensions[s]===!0&&(i[s]=!0);return Object.keys(i).length>0&&(n.extensions=i),n}},Da=class extends At{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new ot,this.projectionMatrix=new ot,this.projectionMatrixInverse=new ot,this.coordinateSystem=rn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,n){return super.copy(e,n),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,n){super.updateWorldMatrix(e,n),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},zn=new U,Ec=new Be,Ac=new Be,Pt=class extends Da{constructor(e=50,n=1,i=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=s,this.focus=10,this.aspect=n,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,n){return super.copy(e,n),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let n=.5*this.getFilmHeight()/e;this.fov=Ys*2*Math.atan(n),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(Hs*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Ys*2*Math.atan(Math.tan(Hs*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,n,i){zn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(zn.x,zn.y).multiplyScalar(-e/zn.z),zn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(zn.x,zn.y).multiplyScalar(-e/zn.z)}getViewSize(e,n){return this.getViewBounds(e,Ec,Ac),n.subVectors(Ac,Ec)}setViewOffset(e,n,i,s,r,o){this.aspect=e/n,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=n,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,n=e*Math.tan(Hs*.5*this.fov)/this.zoom,i=2*n,s=this.aspect*i,r=-.5*s,o=this.view;if(this.view!==null&&this.view.enabled){let u=o.fullWidth,c=o.fullHeight;r+=o.offsetX*s/u,n-=o.offsetY*i/c,s*=o.width/u,i*=o.height/c}let l=this.filmOffset;l!==0&&(r+=e*l/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,n,n-i,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let n=super.toJSON(e);return n.object.fov=this.fov,n.object.zoom=this.zoom,n.object.near=this.near,n.object.far=this.far,n.object.focus=this.focus,n.object.aspect=this.aspect,this.view!==null&&(n.object.view=Object.assign({},this.view)),n.object.filmGauge=this.filmGauge,n.object.filmOffset=this.filmOffset,n}},Bi=-90,Oi=1,Zs=class extends At{constructor(e,n,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new Pt(Bi,Oi,e,n);s.layers=this.layers,this.add(s);let r=new Pt(Bi,Oi,e,n);r.layers=this.layers,this.add(r);let o=new Pt(Bi,Oi,e,n);o.layers=this.layers,this.add(o);let l=new Pt(Bi,Oi,e,n);l.layers=this.layers,this.add(l);let u=new Pt(Bi,Oi,e,n);u.layers=this.layers,this.add(u);let c=new Pt(Bi,Oi,e,n);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,n=this.children.concat(),[i,s,r,o,l,u]=n;for(let c of n)this.remove(c);if(e===rn)i.up.set(0,1,0),i.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),l.up.set(0,1,0),l.lookAt(0,0,1),u.up.set(0,1,0),u.lookAt(0,0,-1);else if(e===Ca)i.up.set(0,-1,0),i.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),l.up.set(0,-1,0),l.lookAt(0,0,1),u.up.set(0,-1,0),u.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of n)this.add(c),c.updateMatrixWorld()}update(e,n){this.parent===null&&this.updateMatrixWorld();let{renderTarget:i,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,o,l,u,c,h]=this.children,f=e.getRenderTarget(),p=e.getActiveCubeFace(),g=e.getActiveMipmapLevel(),y=e.xr.enabled;e.xr.enabled=!1;let v=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,e.setRenderTarget(i,0,s),e.render(n,r),e.setRenderTarget(i,1,s),e.render(n,o),e.setRenderTarget(i,2,s),e.render(n,l),e.setRenderTarget(i,3,s),e.render(n,u),e.setRenderTarget(i,4,s),e.render(n,c),i.texture.generateMipmaps=v,e.setRenderTarget(i,5,s),e.render(n,h),e.setRenderTarget(f,p,g),e.xr.enabled=y,i.texture.needsPMREMUpdate=!0}},Ua=class extends zt{constructor(e=[],n=gi,i,s,r,o,l,u,c,h){super(e,n,i,s,r,o,l,u,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Qs=class extends mn{constructor(e=1,n={}){super(e,e,n),this.isWebGLCubeRenderTarget=!0;let i={width:e,height:e,depth:1},s=[i,i,i,i,i,i];this.texture=new Ua(s),this._setTextureOptions(n),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,n){this.texture.type=n.type,this.texture.colorSpace=n.colorSpace,this.texture.generateMipmaps=n.generateMipmaps,this.texture.minFilter=n.minFilter,this.texture.magFilter=n.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new Lt(5,5,5),r=new cn({name:"CubemapFromEquirect",uniforms:xi(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:Bt,blending:In});r.uniforms.tEquirect.value=n;let o=new yt(s,r),l=n.minFilter;return n.minFilter===$n&&(n.minFilter=on),new Zs(1,10,this).update(e,o),n.minFilter=l,o.geometry.dispose(),o.material.dispose(),this}clear(e,n=!0,i=!0,s=!0){let r=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(n,i,s);e.setRenderTarget(r)}},Zt=class extends At{constructor(){super(),this.isGroup=!0,this.type="Group"}},Wh={type:"move"},Ki=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Zt,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Zt,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new U,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new U),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Zt,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new U,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new U),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let n=this._hand;if(n)for(let i of e.hand.values())this._getHandJoint(n,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,n,i){let s=null,r=null,o=null,l=this._targetRay,u=this._grip,c=this._hand;if(e&&n.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(let v of e.hand.values()){let m=n.getJointPose(v,i),d=this._getHandJoint(c,v);m!==null&&(d.matrix.fromArray(m.transform.matrix),d.matrix.decompose(d.position,d.rotation,d.scale),d.matrixWorldNeedsUpdate=!0,d.jointRadius=m.radius),d.visible=m!==null}let h=c.joints["index-finger-tip"],f=c.joints["thumb-tip"],p=h.position.distanceTo(f.position),g=.02,y=.005;c.inputState.pinching&&p>g+y?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&p<=g-y&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else u!==null&&e.gripSpace&&(r=n.getPose(e.gripSpace,i),r!==null&&(u.matrix.fromArray(r.transform.matrix),u.matrix.decompose(u.position,u.rotation,u.scale),u.matrixWorldNeedsUpdate=!0,r.linearVelocity?(u.hasLinearVelocity=!0,u.linearVelocity.copy(r.linearVelocity)):u.hasLinearVelocity=!1,r.angularVelocity?(u.hasAngularVelocity=!0,u.angularVelocity.copy(r.angularVelocity)):u.hasAngularVelocity=!1));l!==null&&(s=n.getPose(e.targetRaySpace,i),s===null&&r!==null&&(s=r),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1,this.dispatchEvent(Wh)))}return l!==null&&(l.visible=s!==null),u!==null&&(u.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,n){if(e.joints[n.jointName]===void 0){let i=new Zt;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[n.jointName]=i,e.add(i)}return e.joints[n.jointName]}};var Na=class a{constructor(e,n=1,i=1e3){this.isFog=!0,this.name="",this.color=new Oe(e),this.near=n,this.far=i}clone(){return new a(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}},Fa=class extends At{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new ln,this.environmentIntensity=1,this.environmentRotation=new ln,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,n){return super.copy(e,n),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let n=super.toJSON(e);return this.fog!==null&&(n.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(n.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(n.object.backgroundIntensity=this.backgroundIntensity),n.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(n.object.environmentIntensity=this.environmentIntensity),n.object.environmentRotation=this.environmentRotation.toArray(),n}},Ba=class{constructor(e,n){this.isInterleavedBuffer=!0,this.array=e,this.stride=n,this.count=e!==void 0?e.length/n:0,this.usage=js,this.updateRanges=[],this.version=0,this.uuid=Vn()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,n){this.updateRanges.push({start:e,count:n})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,n,i){e*=this.stride,i*=n.stride;for(let s=0,r=this.stride;s<r;s++)this.array[e+s]=n.array[i+s];return this}set(e,n=0){return this.array.set(e,n),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Vn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let n=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),i=new this.constructor(n,this.stride);return i.setUsage(this.usage),i}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Vn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}},Nt=new U,Ji=class a{constructor(e,n,i,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=n,this.offset=i,this.normalized=s}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let n=0,i=this.data.count;n<i;n++)Nt.fromBufferAttribute(this,n),Nt.applyMatrix4(e),this.setXYZ(n,Nt.x,Nt.y,Nt.z);return this}applyNormalMatrix(e){for(let n=0,i=this.count;n<i;n++)Nt.fromBufferAttribute(this,n),Nt.applyNormalMatrix(e),this.setXYZ(n,Nt.x,Nt.y,Nt.z);return this}transformDirection(e){for(let n=0,i=this.count;n<i;n++)Nt.fromBufferAttribute(this,n),Nt.transformDirection(e),this.setXYZ(n,Nt.x,Nt.y,Nt.z);return this}getComponent(e,n){let i=this.array[e*this.data.stride+this.offset+n];return this.normalized&&(i=fn(i,this.array)),i}setComponent(e,n,i){return this.normalized&&(i=at(i,this.array)),this.data.array[e*this.data.stride+this.offset+n]=i,this}setX(e,n){return this.normalized&&(n=at(n,this.array)),this.data.array[e*this.data.stride+this.offset]=n,this}setY(e,n){return this.normalized&&(n=at(n,this.array)),this.data.array[e*this.data.stride+this.offset+1]=n,this}setZ(e,n){return this.normalized&&(n=at(n,this.array)),this.data.array[e*this.data.stride+this.offset+2]=n,this}setW(e,n){return this.normalized&&(n=at(n,this.array)),this.data.array[e*this.data.stride+this.offset+3]=n,this}getX(e){let n=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(n=fn(n,this.array)),n}getY(e){let n=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(n=fn(n,this.array)),n}getZ(e){let n=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(n=fn(n,this.array)),n}getW(e){let n=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(n=fn(n,this.array)),n}setXY(e,n,i){return e=e*this.data.stride+this.offset,this.normalized&&(n=at(n,this.array),i=at(i,this.array)),this.data.array[e+0]=n,this.data.array[e+1]=i,this}setXYZ(e,n,i,s){return e=e*this.data.stride+this.offset,this.normalized&&(n=at(n,this.array),i=at(i,this.array),s=at(s,this.array)),this.data.array[e+0]=n,this.data.array[e+1]=i,this.data.array[e+2]=s,this}setXYZW(e,n,i,s,r){return e=e*this.data.stride+this.offset,this.normalized&&(n=at(n,this.array),i=at(i,this.array),s=at(s,this.array),r=at(r,this.array)),this.data.array[e+0]=n,this.data.array[e+1]=i,this.data.array[e+2]=s,this.data.array[e+3]=r,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let n=[];for(let i=0;i<this.count;i++){let s=i*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)n.push(this.data.array[s+r])}return new It(new this.array.constructor(n),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new a(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let n=[];for(let i=0;i<this.count;i++){let s=i*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)n.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:n,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},di=class extends gn{constructor(e){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new Oe(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},zi,Sa=new U,Hi=new U,Vi=new U,Gi=new Be,wa=new Be,Au=new ot,Rs=new U,Ta=new U,Ps=new U,kc=new Be,$o=new Be,Cc=new Be,Zi=class extends At{constructor(e=new di){if(super(),this.isSprite=!0,this.type="Sprite",zi===void 0){zi=new Ft;let n=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),i=new Ba(n,5);zi.setIndex([0,1,2,0,2,3]),zi.setAttribute("position",new Ji(i,3,0,!1)),zi.setAttribute("uv",new Ji(i,2,3,!1))}this.geometry=zi,this.material=e,this.center=new Be(.5,.5),this.count=1}raycast(e,n){e.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),Hi.setFromMatrixScale(this.matrixWorld),Au.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),Vi.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&Hi.multiplyScalar(-Vi.z);let i=this.material.rotation,s,r;i!==0&&(r=Math.cos(i),s=Math.sin(i));let o=this.center;Is(Rs.set(-.5,-.5,0),Vi,o,Hi,s,r),Is(Ta.set(.5,-.5,0),Vi,o,Hi,s,r),Is(Ps.set(.5,.5,0),Vi,o,Hi,s,r),kc.set(0,0),$o.set(1,0),Cc.set(1,1);let l=e.ray.intersectTriangle(Rs,Ta,Ps,!1,Sa);if(l===null&&(Is(Ta.set(-.5,.5,0),Vi,o,Hi,s,r),$o.set(0,1),l=e.ray.intersectTriangle(Rs,Ps,Ta,!1,Sa),l===null))return;let u=e.ray.origin.distanceTo(Sa);u<e.near||u>e.far||n.push({distance:u,point:Sa.clone(),uv:pn.getInterpolation(Sa,Rs,Ta,Ps,kc,$o,Cc,new Be),face:null,object:this})}copy(e,n){return super.copy(e,n),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}};function Is(a,e,n,i,s,r){Gi.subVectors(a,n).addScalar(.5).multiply(i),s!==void 0?(wa.x=r*Gi.x-s*Gi.y,wa.y=s*Gi.x+r*Gi.y):wa.copy(Gi),a.copy(e),a.x+=wa.x,a.y+=wa.y,a.applyMatrix4(Au)}var Ko=new U,Xh=new U,qh=new ze,dn=class{constructor(e=new U(1,0,0),n=0){this.isPlane=!0,this.normal=e,this.constant=n}set(e,n){return this.normal.copy(e),this.constant=n,this}setComponents(e,n,i,s){return this.normal.set(e,n,i),this.constant=s,this}setFromNormalAndCoplanarPoint(e,n){return this.normal.copy(e),this.constant=-n.dot(this.normal),this}setFromCoplanarPoints(e,n,i){let s=Ko.subVectors(i,n).cross(Xh.subVectors(e,n)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,n){return n.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,n){let i=e.delta(Ko),s=this.normal.dot(i);if(s===0)return this.distanceToPoint(e.start)===0?n.copy(e.start):null;let r=-(e.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:n.copy(e.start).addScaledVector(i,r)}intersectsLine(e){let n=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return n<0&&i>0||i<0&&n>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,n){let i=n||qh.getNormalMatrix(e),s=this.coplanarPoint(Ko).applyMatrix4(e),r=this.normal.applyMatrix3(i).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},ri=new hi,jh=new Be(.5,.5),Ls=new U,qn=class{constructor(e=new dn,n=new dn,i=new dn,s=new dn,r=new dn,o=new dn){this.planes=[e,n,i,s,r,o]}set(e,n,i,s,r,o){let l=this.planes;return l[0].copy(e),l[1].copy(n),l[2].copy(i),l[3].copy(s),l[4].copy(r),l[5].copy(o),this}copy(e){let n=this.planes;for(let i=0;i<6;i++)n[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,n=rn,i=!1){let s=this.planes,r=e.elements,o=r[0],l=r[1],u=r[2],c=r[3],h=r[4],f=r[5],p=r[6],g=r[7],y=r[8],v=r[9],m=r[10],d=r[11],T=r[12],_=r[13],x=r[14],A=r[15];if(s[0].setComponents(c-o,g-h,d-y,A-T).normalize(),s[1].setComponents(c+o,g+h,d+y,A+T).normalize(),s[2].setComponents(c+l,g+f,d+v,A+_).normalize(),s[3].setComponents(c-l,g-f,d-v,A-_).normalize(),i)s[4].setComponents(u,p,m,x).normalize(),s[5].setComponents(c-u,g-p,d-m,A-x).normalize();else if(s[4].setComponents(c-u,g-p,d-m,A-x).normalize(),n===rn)s[5].setComponents(c+u,g+p,d+m,A+x).normalize();else if(n===Ca)s[5].setComponents(u,p,m,x).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+n);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),ri.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let n=e.geometry;n.boundingSphere===null&&n.computeBoundingSphere(),ri.copy(n.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(ri)}intersectsSprite(e){ri.center.set(0,0,0);let n=jh.distanceTo(e.center);return ri.radius=.7071067811865476+n,ri.applyMatrix4(e.matrixWorld),this.intersectsSphere(ri)}intersectsSphere(e){let n=this.planes,i=e.center,s=-e.radius;for(let r=0;r<6;r++)if(n[r].distanceToPoint(i)<s)return!1;return!0}intersectsBox(e){let n=this.planes;for(let i=0;i<6;i++){let s=n[i];if(Ls.x=s.normal.x>0?e.max.x:e.min.x,Ls.y=s.normal.y>0?e.max.y:e.min.y,Ls.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(Ls)<0)return!1}return!0}containsPoint(e){let n=this.planes;for(let i=0;i<6;i++)if(n[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var Qi=class extends gn{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Oe(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},er=new U,tr=new U,Rc=new ot,Ea=new Yi,Ds=new hi,Jo=new U,Pc=new U,nr=class extends At{constructor(e=new Ft,n=new Qi){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=n,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,n){return super.copy(e,n),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let n=e.attributes.position,i=[0];for(let s=1,r=n.count;s<r;s++)er.fromBufferAttribute(n,s-1),tr.fromBufferAttribute(n,s),i[s]=i[s-1],i[s]+=er.distanceTo(tr);e.setAttribute("lineDistance",new vt(i,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,n){let i=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,o=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Ds.copy(i.boundingSphere),Ds.applyMatrix4(s),Ds.radius+=r,e.ray.intersectsSphere(Ds)===!1)return;Rc.copy(s).invert(),Ea.copy(e.ray).applyMatrix4(Rc);let l=r/((this.scale.x+this.scale.y+this.scale.z)/3),u=l*l,c=this.isLineSegments?2:1,h=i.index,p=i.attributes.position;if(h!==null){let g=Math.max(0,o.start),y=Math.min(h.count,o.start+o.count);for(let v=g,m=y-1;v<m;v+=c){let d=h.getX(v),T=h.getX(v+1),_=Us(this,e,Ea,u,d,T,v);_&&n.push(_)}if(this.isLineLoop){let v=h.getX(y-1),m=h.getX(g),d=Us(this,e,Ea,u,v,m,y-1);d&&n.push(d)}}else{let g=Math.max(0,o.start),y=Math.min(p.count,o.start+o.count);for(let v=g,m=y-1;v<m;v+=c){let d=Us(this,e,Ea,u,v,v+1,v);d&&n.push(d)}if(this.isLineLoop){let v=Us(this,e,Ea,u,y-1,g,y-1);v&&n.push(v)}}}updateMorphTargets(){let n=this.geometry.morphAttributes,i=Object.keys(n);if(i.length>0){let s=n[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let l=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[l]=r}}}}};function Us(a,e,n,i,s,r,o){let l=a.geometry.attributes.position;if(er.fromBufferAttribute(l,s),tr.fromBufferAttribute(l,r),n.distanceSqToSegment(er,tr,Jo,Pc)>i)return;Jo.applyMatrix4(a.matrixWorld);let c=e.ray.origin.distanceTo(Jo);if(!(c<e.near||c>e.far))return{distance:c,point:Pc.clone().applyMatrix4(a.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:a}}var Ic=new U,Lc=new U,Oa=class extends nr{constructor(e,n){super(e,n),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let e=this.geometry;if(e.index===null){let n=e.attributes.position,i=[];for(let s=0,r=n.count;s<r;s+=2)Ic.fromBufferAttribute(n,s),Lc.fromBufferAttribute(n,s+1),i[s]=s===0?0:i[s-1],i[s+1]=i[s]+Ic.distanceTo(Lc);e.setAttribute("lineDistance",new vt(i,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}};var fi=class extends zt{constructor(e,n,i,s,r,o,l,u,c){super(e,n,i,s,r,o,l,u,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},za=class extends zt{constructor(e,n,i=Kn,s,r,o,l=Qt,u=Qt,c,h=Xi,f=1){if(h!==Xi&&h!==aa)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let p={width:e,height:n,depth:f};super(p,s,r,o,l,u,h,i,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new ji(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let n=super.toJSON(e);return this.compareFunction!==null&&(n.compareFunction=this.compareFunction),n}},Ha=class extends zt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}};var ir=class a extends Ft{constructor(e=1,n=1,i=1,s=32,r=1,o=!1,l=0,u=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:n,height:i,radialSegments:s,heightSegments:r,openEnded:o,thetaStart:l,thetaLength:u};let c=this;s=Math.floor(s),r=Math.floor(r);let h=[],f=[],p=[],g=[],y=0,v=[],m=i/2,d=0;T(),o===!1&&(e>0&&_(!0),n>0&&_(!1)),this.setIndex(h),this.setAttribute("position",new vt(f,3)),this.setAttribute("normal",new vt(p,3)),this.setAttribute("uv",new vt(g,2));function T(){let x=new U,A=new U,E=0,C=(n-e)/i;for(let P=0;P<=r;P++){let M=[],w=P/r,I=w*(n-e)+e;for(let D=0;D<=s;D++){let z=D/s,H=z*u+l,j=Math.sin(H),W=Math.cos(H);A.x=I*j,A.y=-w*i+m,A.z=I*W,f.push(A.x,A.y,A.z),x.set(j,C,W).normalize(),p.push(x.x,x.y,x.z),g.push(z,1-w),M.push(y++)}v.push(M)}for(let P=0;P<s;P++)for(let M=0;M<r;M++){let w=v[M][P],I=v[M+1][P],D=v[M+1][P+1],z=v[M][P+1];(e>0||M!==0)&&(h.push(w,I,z),E+=3),(n>0||M!==r-1)&&(h.push(I,D,z),E+=3)}c.addGroup(d,E,0),d+=E}function _(x){let A=y,E=new Be,C=new U,P=0,M=x===!0?e:n,w=x===!0?1:-1;for(let D=1;D<=s;D++)f.push(0,m*w,0),p.push(0,w,0),g.push(.5,.5),y++;let I=y;for(let D=0;D<=s;D++){let H=D/s*u+l,j=Math.cos(H),W=Math.sin(H);C.x=M*W,C.y=m*w,C.z=M*j,f.push(C.x,C.y,C.z),p.push(0,w,0),E.x=j*.5+.5,E.y=W*.5*w+.5,g.push(E.x,E.y),y++}for(let D=0;D<s;D++){let z=A+D,H=I+D;x===!0?h.push(H,H+1,z):h.push(H+1,H,z),P+=3}c.addGroup(d,P,x===!0?1:2),d+=P}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new a(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},Va=class a extends ir{constructor(e=1,n=1,i=32,s=1,r=!1,o=0,l=Math.PI*2){super(0,e,n,i,s,r,o,l),this.type="ConeGeometry",this.parameters={radius:e,height:n,radialSegments:i,heightSegments:s,openEnded:r,thetaStart:o,thetaLength:l}}static fromJSON(e){return new a(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},ar=class a extends Ft{constructor(e=[],n=[],i=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:n,radius:i,detail:s};let r=[],o=[];l(s),c(i),h(),this.setAttribute("position",new vt(r,3)),this.setAttribute("normal",new vt(r.slice(),3)),this.setAttribute("uv",new vt(o,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function l(T){let _=new U,x=new U,A=new U;for(let E=0;E<n.length;E+=3)g(n[E+0],_),g(n[E+1],x),g(n[E+2],A),u(_,x,A,T)}function u(T,_,x,A){let E=A+1,C=[];for(let P=0;P<=E;P++){C[P]=[];let M=T.clone().lerp(x,P/E),w=_.clone().lerp(x,P/E),I=E-P;for(let D=0;D<=I;D++)D===0&&P===E?C[P][D]=M:C[P][D]=M.clone().lerp(w,D/I)}for(let P=0;P<E;P++)for(let M=0;M<2*(E-P)-1;M++){let w=Math.floor(M/2);M%2===0?(p(C[P][w+1]),p(C[P+1][w]),p(C[P][w])):(p(C[P][w+1]),p(C[P+1][w+1]),p(C[P+1][w]))}}function c(T){let _=new U;for(let x=0;x<r.length;x+=3)_.x=r[x+0],_.y=r[x+1],_.z=r[x+2],_.normalize().multiplyScalar(T),r[x+0]=_.x,r[x+1]=_.y,r[x+2]=_.z}function h(){let T=new U;for(let _=0;_<r.length;_+=3){T.x=r[_+0],T.y=r[_+1],T.z=r[_+2];let x=m(T)/2/Math.PI+.5,A=d(T)/Math.PI+.5;o.push(x,1-A)}y(),f()}function f(){for(let T=0;T<o.length;T+=6){let _=o[T+0],x=o[T+2],A=o[T+4],E=Math.max(_,x,A),C=Math.min(_,x,A);E>.9&&C<.1&&(_<.2&&(o[T+0]+=1),x<.2&&(o[T+2]+=1),A<.2&&(o[T+4]+=1))}}function p(T){r.push(T.x,T.y,T.z)}function g(T,_){let x=T*3;_.x=e[x+0],_.y=e[x+1],_.z=e[x+2]}function y(){let T=new U,_=new U,x=new U,A=new U,E=new Be,C=new Be,P=new Be;for(let M=0,w=0;M<r.length;M+=9,w+=6){T.set(r[M+0],r[M+1],r[M+2]),_.set(r[M+3],r[M+4],r[M+5]),x.set(r[M+6],r[M+7],r[M+8]),E.set(o[w+0],o[w+1]),C.set(o[w+2],o[w+3]),P.set(o[w+4],o[w+5]),A.copy(T).add(_).add(x).divideScalar(3);let I=m(A);v(E,w+0,T,I),v(C,w+2,_,I),v(P,w+4,x,I)}}function v(T,_,x,A){A<0&&T.x===1&&(o[_]=T.x-1),x.x===0&&x.z===0&&(o[_]=A/2/Math.PI+.5)}function m(T){return Math.atan2(T.z,-T.x)}function d(T){return Math.atan2(-T.y,Math.sqrt(T.x*T.x+T.z*T.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new a(e.vertices,e.indices,e.radius,e.details)}};var Ns=new U,Fs=new U,Zo=new U,Bs=new pn,Ga=class extends Ft{constructor(e=null,n=1){if(super(),this.type="EdgesGeometry",this.parameters={geometry:e,thresholdAngle:n},e!==null){let s=Math.pow(10,4),r=Math.cos(Hs*n),o=e.getIndex(),l=e.getAttribute("position"),u=o?o.count:l.count,c=[0,0,0],h=["a","b","c"],f=new Array(3),p={},g=[];for(let y=0;y<u;y+=3){o?(c[0]=o.getX(y),c[1]=o.getX(y+1),c[2]=o.getX(y+2)):(c[0]=y,c[1]=y+1,c[2]=y+2);let{a:v,b:m,c:d}=Bs;if(v.fromBufferAttribute(l,c[0]),m.fromBufferAttribute(l,c[1]),d.fromBufferAttribute(l,c[2]),Bs.getNormal(Zo),f[0]=`${Math.round(v.x*s)},${Math.round(v.y*s)},${Math.round(v.z*s)}`,f[1]=`${Math.round(m.x*s)},${Math.round(m.y*s)},${Math.round(m.z*s)}`,f[2]=`${Math.round(d.x*s)},${Math.round(d.y*s)},${Math.round(d.z*s)}`,!(f[0]===f[1]||f[1]===f[2]||f[2]===f[0]))for(let T=0;T<3;T++){let _=(T+1)%3,x=f[T],A=f[_],E=Bs[h[T]],C=Bs[h[_]],P=`${x}_${A}`,M=`${A}_${x}`;M in p&&p[M]?(Zo.dot(p[M].normal)<=r&&(g.push(E.x,E.y,E.z),g.push(C.x,C.y,C.z)),p[M]=null):P in p||(p[P]={index0:c[T],index1:c[_],normal:Zo.clone()})}}for(let y in p)if(p[y]){let{index0:v,index1:m}=p[y];Ns.fromBufferAttribute(l,v),Fs.fromBufferAttribute(l,m),g.push(Ns.x,Ns.y,Ns.z),g.push(Fs.x,Fs.y,Fs.z)}this.setAttribute("position",new vt(g,3))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}};var Wa=class a extends ar{constructor(e=1,n=0){let i=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],s=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(i,s,e,n),this.type="OctahedronGeometry",this.parameters={radius:e,detail:n}}static fromJSON(e){return new a(e.radius,e.detail)}},pi=class a extends Ft{constructor(e=1,n=1,i=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:n,widthSegments:i,heightSegments:s};let r=e/2,o=n/2,l=Math.floor(i),u=Math.floor(s),c=l+1,h=u+1,f=e/l,p=n/u,g=[],y=[],v=[],m=[];for(let d=0;d<h;d++){let T=d*p-o;for(let _=0;_<c;_++){let x=_*f-r;y.push(x,-T,0),v.push(0,0,1),m.push(_/l),m.push(1-d/u)}}for(let d=0;d<u;d++)for(let T=0;T<l;T++){let _=T+c*d,x=T+c*(d+1),A=T+1+c*(d+1),E=T+1+c*d;g.push(_,x,E),g.push(x,A,E)}this.setIndex(g),this.setAttribute("position",new vt(y,3)),this.setAttribute("normal",new vt(v,3)),this.setAttribute("uv",new vt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new a(e.width,e.height,e.widthSegments,e.heightSegments)}};var ea=class extends gn{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Oe(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Oe(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Sl,this.normalScale=new Be(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ln,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}};var sr=class extends gn{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=fu,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},rr=class extends gn{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function Os(a,e){return!a||a.constructor===e?a:typeof e.BYTES_PER_ELEMENT=="number"?new e(a):Array.prototype.slice.call(a)}function Yh(a){return ArrayBuffer.isView(a)&&!(a instanceof DataView)}var mi=class{constructor(e,n,i,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new n.constructor(i),this.sampleValues=n,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(e){let n=this.parameterPositions,i=this._cachedIndex,s=n[i],r=n[i-1];n:{e:{let o;t:{i:if(!(e<s)){for(let l=i+2;;){if(s===void 0){if(e<r)break i;return i=n.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===l)break;if(r=s,s=n[++i],e<s)break e}o=n.length;break t}if(!(e>=r)){let l=n[1];e<l&&(i=2,r=l);for(let u=i-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===u)break;if(s=r,r=n[--i-1],e>=r)break e}o=i,i=0;break t}break n}for(;i<o;){let l=i+o>>>1;e<n[l]?o=l:i=l+1}if(s=n[i],r=n[i-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return i=n.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,r,s)}return this.interpolate_(i,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let n=this.resultBuffer,i=this.sampleValues,s=this.valueSize,r=e*s;for(let o=0;o!==s;++o)n[o]=i[r+o];return n}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},or=class extends mi{constructor(e,n,i,s){super(e,n,i,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:el,endingEnd:el}}intervalChanged_(e,n,i){let s=this.parameterPositions,r=e-2,o=e+1,l=s[r],u=s[o];if(l===void 0)switch(this.getSettings_().endingStart){case tl:r=e,l=2*n-i;break;case nl:r=s.length-2,l=n+s[r]-s[r+1];break;default:r=e,l=i}if(u===void 0)switch(this.getSettings_().endingEnd){case tl:o=e,u=2*i-n;break;case nl:o=1,u=i+s[1]-s[0];break;default:o=e-1,u=n}let c=(i-n)*.5,h=this.valueSize;this._weightPrev=c/(n-l),this._weightNext=c/(u-i),this._offsetPrev=r*h,this._offsetNext=o*h}interpolate_(e,n,i,s){let r=this.resultBuffer,o=this.sampleValues,l=this.valueSize,u=e*l,c=u-l,h=this._offsetPrev,f=this._offsetNext,p=this._weightPrev,g=this._weightNext,y=(i-n)/(s-n),v=y*y,m=v*y,d=-p*m+2*p*v-p*y,T=(1+p)*m+(-1.5-2*p)*v+(-.5+p)*y+1,_=(-1-g)*m+(1.5+g)*v+.5*y,x=g*m-g*v;for(let A=0;A!==l;++A)r[A]=d*o[h+A]+T*o[c+A]+_*o[u+A]+x*o[f+A];return r}},lr=class extends mi{constructor(e,n,i,s){super(e,n,i,s)}interpolate_(e,n,i,s){let r=this.resultBuffer,o=this.sampleValues,l=this.valueSize,u=e*l,c=u-l,h=(i-n)/(s-n),f=1-h;for(let p=0;p!==l;++p)r[p]=o[c+p]*f+o[u+p]*h;return r}},cr=class extends mi{constructor(e,n,i,s){super(e,n,i,s)}interpolate_(e){return this.copySampleValue_(e-1)}},qt=class{constructor(e,n,i,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(n===void 0||n.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Os(n,this.TimeBufferType),this.values=Os(i,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){let n=e.constructor,i;if(n.toJSON!==this.toJSON)i=n.toJSON(e);else{i={name:e.name,times:Os(e.times,Array),values:Os(e.values,Array)};let s=e.getInterpolation();s!==e.DefaultInterpolation&&(i.interpolation=s)}return i.type=e.ValueTypeName,i}InterpolantFactoryMethodDiscrete(e){return new cr(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new lr(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new or(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let n;switch(e){case Aa:n=this.InterpolantFactoryMethodDiscrete;break;case qs:n=this.InterpolantFactoryMethodLinear;break;case zs:n=this.InterpolantFactoryMethodSmooth;break}if(n===void 0){let i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return console.warn("THREE.KeyframeTrack:",i),this}return this.createInterpolant=n,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Aa;case this.InterpolantFactoryMethodLinear:return qs;case this.InterpolantFactoryMethodSmooth:return zs}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let n=this.times;for(let i=0,s=n.length;i!==s;++i)n[i]+=e}return this}scale(e){if(e!==1){let n=this.times;for(let i=0,s=n.length;i!==s;++i)n[i]*=e}return this}trim(e,n){let i=this.times,s=i.length,r=0,o=s-1;for(;r!==s&&i[r]<e;)++r;for(;o!==-1&&i[o]>n;)--o;if(++o,r!==0||o!==s){r>=o&&(o=Math.max(o,1),r=o-1);let l=this.getValueSize();this.times=i.slice(r,o),this.values=this.values.slice(r*l,o*l)}return this}validate(){let e=!0,n=this.getValueSize();n-Math.floor(n)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);let i=this.times,s=this.values,r=i.length;r===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let l=0;l!==r;l++){let u=i[l];if(typeof u=="number"&&isNaN(u)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,l,u),e=!1;break}if(o!==null&&o>u){console.error("THREE.KeyframeTrack: Out of order keys.",this,l,u,o),e=!1;break}o=u}if(s!==void 0&&Yh(s))for(let l=0,u=s.length;l!==u;++l){let c=s[l];if(isNaN(c)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,l,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),n=this.values.slice(),i=this.getValueSize(),s=this.getInterpolation()===zs,r=e.length-1,o=1;for(let l=1;l<r;++l){let u=!1,c=e[l],h=e[l+1];if(c!==h&&(l!==1||c!==e[0]))if(s)u=!0;else{let f=l*i,p=f-i,g=f+i;for(let y=0;y!==i;++y){let v=n[f+y];if(v!==n[p+y]||v!==n[g+y]){u=!0;break}}}if(u){if(l!==o){e[o]=e[l];let f=l*i,p=o*i;for(let g=0;g!==i;++g)n[p+g]=n[f+g]}++o}}if(r>0){e[o]=e[r];for(let l=r*i,u=o*i,c=0;c!==i;++c)n[u+c]=n[l+c];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=n.slice(0,o*i)):(this.times=e,this.values=n),this}clone(){let e=this.times.slice(),n=this.values.slice(),i=this.constructor,s=new i(this.name,e,n);return s.createInterpolant=this.createInterpolant,s}};qt.prototype.ValueTypeName="";qt.prototype.TimeBufferType=Float32Array;qt.prototype.ValueBufferType=Float32Array;qt.prototype.DefaultInterpolation=qs;var jn=class extends qt{constructor(e,n,i){super(e,n,i)}};jn.prototype.ValueTypeName="bool";jn.prototype.ValueBufferType=Array;jn.prototype.DefaultInterpolation=Aa;jn.prototype.InterpolantFactoryMethodLinear=void 0;jn.prototype.InterpolantFactoryMethodSmooth=void 0;var ur=class extends qt{constructor(e,n,i,s){super(e,n,i,s)}};ur.prototype.ValueTypeName="color";var hr=class extends qt{constructor(e,n,i,s){super(e,n,i,s)}};hr.prototype.ValueTypeName="number";var dr=class extends mi{constructor(e,n,i,s){super(e,n,i,s)}interpolate_(e,n,i,s){let r=this.resultBuffer,o=this.sampleValues,l=this.valueSize,u=(i-n)/(s-n),c=e*l;for(let h=c+l;c!==h;c+=4)Pn.slerpFlat(r,0,o,c-l,o,c,u);return r}},Xa=class extends qt{constructor(e,n,i,s){super(e,n,i,s)}InterpolantFactoryMethodLinear(e){return new dr(this.times,this.values,this.getValueSize(),e)}};Xa.prototype.ValueTypeName="quaternion";Xa.prototype.InterpolantFactoryMethodSmooth=void 0;var Yn=class extends qt{constructor(e,n,i){super(e,n,i)}};Yn.prototype.ValueTypeName="string";Yn.prototype.ValueBufferType=Array;Yn.prototype.DefaultInterpolation=Aa;Yn.prototype.InterpolantFactoryMethodLinear=void 0;Yn.prototype.InterpolantFactoryMethodSmooth=void 0;var fr=class extends qt{constructor(e,n,i,s){super(e,n,i,s)}};fr.prototype.ValueTypeName="vector";var pr=class{constructor(e,n,i){let s=this,r=!1,o=0,l=0,u,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=n,this.onError=i,this.abortController=new AbortController,this.itemStart=function(h){l++,r===!1&&s.onStart!==void 0&&s.onStart(h,o,l),r=!0},this.itemEnd=function(h){o++,s.onProgress!==void 0&&s.onProgress(h,o,l),o===l&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(h){s.onError!==void 0&&s.onError(h)},this.resolveURL=function(h){return u?u(h):h},this.setURLModifier=function(h){return u=h,this},this.addHandler=function(h,f){return c.push(h,f),this},this.removeHandler=function(h){let f=c.indexOf(h);return f!==-1&&c.splice(f,2),this},this.getHandler=function(h){for(let f=0,p=c.length;f<p;f+=2){let g=c[f],y=c[f+1];if(g.global&&(g.lastIndex=0),g.test(h))return y}return null},this.abort=function(){return this.abortController.abort(),this.abortController=new AbortController,this}}},ku=new pr,mr=class{constructor(e){this.manager=e!==void 0?e:ku,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,n){let i=this;return new Promise(function(s,r){i.load(e,s,n,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};mr.DEFAULT_MATERIAL_NAME="__DEFAULT";var qa=class extends At{constructor(e,n=1){super(),this.isLight=!0,this.type="Light",this.color=new Oe(e),this.intensity=n}dispose(){}copy(e,n){return super.copy(e,n),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let n=super.toJSON(e);return n.object.color=this.color.getHex(),n.object.intensity=this.intensity,this.groundColor!==void 0&&(n.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(n.object.distance=this.distance),this.angle!==void 0&&(n.object.angle=this.angle),this.decay!==void 0&&(n.object.decay=this.decay),this.penumbra!==void 0&&(n.object.penumbra=this.penumbra),this.shadow!==void 0&&(n.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(n.object.target=this.target.uuid),n}},ja=class extends qa{constructor(e,n,i){super(e,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(At.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Oe(n)}copy(e,n){return super.copy(e,n),this.groundColor.copy(e.groundColor),this}},Qo=new ot,Dc=new U,Uc=new U,al=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Be(512,512),this.mapType=un,this.map=null,this.mapPass=null,this.matrix=new ot,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new qn,this._frameExtents=new Be(1,1),this._viewportCount=1,this._viewports=[new gt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let n=this.camera,i=this.matrix;Dc.setFromMatrixPosition(e.matrixWorld),n.position.copy(Dc),Uc.setFromMatrixPosition(e.target.matrixWorld),n.lookAt(Uc),n.updateMatrixWorld(),Qo.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Qo,n.coordinateSystem,n.reversedDepth),n.reversedDepth?i.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(Qo)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}};var Ya=class extends Da{constructor(e=-1,n=1,i=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=n,this.top=i,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(e,n){return super.copy(e,n),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,n,i,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=n,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),n=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=i-e,o=i+e,l=s+n,u=s-n;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,l-=h*this.view.offsetY,u=l-h*this.view.height}this.projectionMatrix.makeOrthographic(r,o,l,u,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let n=super.toJSON(e);return n.object.zoom=this.zoom,n.object.left=this.left,n.object.right=this.right,n.object.top=this.top,n.object.bottom=this.bottom,n.object.near=this.near,n.object.far=this.far,this.view!==null&&(n.object.view=Object.assign({},this.view)),n}},sl=class extends al{constructor(){super(new Ya(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},$a=class extends qa{constructor(e,n){super(e,n),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(At.DEFAULT_UP),this.updateMatrix(),this.target=new At,this.shadow=new sl}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}};var gr=class extends Pt{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}},Ka=class{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=performance.now(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){let n=performance.now();e=(n-this.oldTime)/1e3,this.oldTime=n,this.elapsedTime+=e}return e}};var kl="\\[\\]\\.:\\/",$h=new RegExp("["+kl+"]","g"),Cl="[^"+kl+"]",Kh="[^"+kl.replace("\\.","")+"]",Jh=/((?:WC+[\/:])*)/.source.replace("WC",Cl),Zh=/(WCOD+)?/.source.replace("WCOD",Kh),Qh=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Cl),ed=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Cl),td=new RegExp("^"+Jh+Zh+Qh+ed+"$"),nd=["material","materials","bones","map"],rl=class{constructor(e,n,i){let s=i||dt.parseTrackName(n);this._targetGroup=e,this._bindings=e.subscribe_(n,s)}getValue(e,n){this.bind();let i=this._targetGroup.nCachedObjects_,s=this._bindings[i];s!==void 0&&s.getValue(e,n)}setValue(e,n){let i=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=i.length;s!==r;++s)i[s].setValue(e,n)}bind(){let e=this._bindings;for(let n=this._targetGroup.nCachedObjects_,i=e.length;n!==i;++n)e[n].bind()}unbind(){let e=this._bindings;for(let n=this._targetGroup.nCachedObjects_,i=e.length;n!==i;++n)e[n].unbind()}},dt=class a{constructor(e,n,i){this.path=n,this.parsedPath=i||a.parseTrackName(n),this.node=a.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,n,i){return e&&e.isAnimationObjectGroup?new a.Composite(e,n,i):new a(e,n,i)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace($h,"")}static parseTrackName(e){let n=td.exec(e);if(n===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);let i={nodeName:n[2],objectName:n[3],objectIndex:n[4],propertyName:n[5],propertyIndex:n[6]},s=i.nodeName&&i.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=i.nodeName.substring(s+1);nd.indexOf(r)!==-1&&(i.nodeName=i.nodeName.substring(0,s),i.objectName=r)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return i}static findNode(e,n){if(n===void 0||n===""||n==="."||n===-1||n===e.name||n===e.uuid)return e;if(e.skeleton){let i=e.skeleton.getBoneByName(n);if(i!==void 0)return i}if(e.children){let i=function(r){for(let o=0;o<r.length;o++){let l=r[o];if(l.name===n||l.uuid===n)return l;let u=i(l.children);if(u)return u}return null},s=i(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,n){e[n]=this.targetObject[this.propertyName]}_getValue_array(e,n){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)e[n++]=i[s]}_getValue_arrayElement(e,n){e[n]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,n){this.resolvedProperty.toArray(e,n)}_setValue_direct(e,n){this.targetObject[this.propertyName]=e[n]}_setValue_direct_setNeedsUpdate(e,n){this.targetObject[this.propertyName]=e[n],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,n){this.targetObject[this.propertyName]=e[n],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,n){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[n++]}_setValue_array_setNeedsUpdate(e,n){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[n++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,n){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[n++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,n){this.resolvedProperty[this.propertyIndex]=e[n]}_setValue_arrayElement_setNeedsUpdate(e,n){this.resolvedProperty[this.propertyIndex]=e[n],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,n){this.resolvedProperty[this.propertyIndex]=e[n],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,n){this.resolvedProperty.fromArray(e,n)}_setValue_fromArray_setNeedsUpdate(e,n){this.resolvedProperty.fromArray(e,n),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,n){this.resolvedProperty.fromArray(e,n),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,n){this.bind(),this.getValue(e,n)}_setValue_unbound(e,n){this.bind(),this.setValue(e,n)}bind(){let e=this.node,n=this.parsedPath,i=n.objectName,s=n.propertyName,r=n.propertyIndex;if(e||(e=a.findNode(this.rootNode,n.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let c=n.objectIndex;switch(i){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===c){c=h;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[i]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[i]}if(c!==void 0){if(e[c]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let o=e[s];if(o===void 0){let c=n.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",e);return}let l=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?l=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(l=this.Versioning.MatrixWorldNeedsUpdate);let u=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}u=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(u=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(u=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=s;this.getValue=this.GetterByBindingType[u],this.setValue=this.SetterByBindingTypeAndVersioning[u][l]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};dt.Composite=rl;dt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};dt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};dt.prototype.GetterByBindingType=[dt.prototype._getValue_direct,dt.prototype._getValue_array,dt.prototype._getValue_arrayElement,dt.prototype._getValue_toArray];dt.prototype.SetterByBindingTypeAndVersioning=[[dt.prototype._setValue_direct,dt.prototype._setValue_direct_setNeedsUpdate,dt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[dt.prototype._setValue_array,dt.prototype._setValue_array_setNeedsUpdate,dt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[dt.prototype._setValue_arrayElement,dt.prototype._setValue_arrayElement_setNeedsUpdate,dt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[dt.prototype._setValue_fromArray,dt.prototype._setValue_fromArray_setNeedsUpdate,dt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Qg=new Float32Array(1);var Nc=new ot,Ja=class{constructor(e,n,i=0,s=1/0){this.ray=new Yi(e,n),this.near=i,this.far=s,this.camera=null,this.layers=new $i,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,n){this.ray.set(e,n)}setFromCamera(e,n){n.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(n.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(n).sub(this.ray.origin).normalize(),this.camera=n):n.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(n.near+n.far)/(n.near-n.far)).unproject(n),this.ray.direction.set(0,0,-1).transformDirection(n.matrixWorld),this.camera=n):console.error("THREE.Raycaster: Unsupported camera type: "+n.type)}setFromXRController(e){return Nc.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Nc),this}intersectObject(e,n=!0,i=[]){return ol(e,this,i,n),i.sort(Fc),i}intersectObjects(e,n=!0,i=[]){for(let s=0,r=e.length;s<r;s++)ol(e[s],this,i,n);return i.sort(Fc),i}};function Fc(a,e){return a.distance-e.distance}function ol(a,e,n,i){let s=!0;if(a.layers.test(e.layers)&&a.raycast(e,n)===!1&&(s=!1),s===!0&&i===!0){let r=a.children;for(let o=0,l=r.length;o<l;o++)ol(r[o],e,n,!0)}}function Rl(a,e,n,i){let s=id(i);switch(n){case _l:return a*e;case vl:return a*e/s.components*s.byteLength;case Ir:return a*e/s.components*s.byteLength;case Ml:return a*e*2/s.components*s.byteLength;case Lr:return a*e*2/s.components*s.byteLength;case bl:return a*e*3/s.components*s.byteLength;case en:return a*e*4/s.components*s.byteLength;case Dr:return a*e*4/s.components*s.byteLength;case es:case ts:return Math.floor((a+3)/4)*Math.floor((e+3)/4)*8;case ns:case is:return Math.floor((a+3)/4)*Math.floor((e+3)/4)*16;case Nr:case Br:return Math.max(a,16)*Math.max(e,8)/4;case Ur:case Fr:return Math.max(a,8)*Math.max(e,8)/2;case Or:case zr:return Math.floor((a+3)/4)*Math.floor((e+3)/4)*8;case Hr:return Math.floor((a+3)/4)*Math.floor((e+3)/4)*16;case Vr:return Math.floor((a+3)/4)*Math.floor((e+3)/4)*16;case Gr:return Math.floor((a+4)/5)*Math.floor((e+3)/4)*16;case Wr:return Math.floor((a+4)/5)*Math.floor((e+4)/5)*16;case Xr:return Math.floor((a+5)/6)*Math.floor((e+4)/5)*16;case qr:return Math.floor((a+5)/6)*Math.floor((e+5)/6)*16;case jr:return Math.floor((a+7)/8)*Math.floor((e+4)/5)*16;case Yr:return Math.floor((a+7)/8)*Math.floor((e+5)/6)*16;case $r:return Math.floor((a+7)/8)*Math.floor((e+7)/8)*16;case Kr:return Math.floor((a+9)/10)*Math.floor((e+4)/5)*16;case Jr:return Math.floor((a+9)/10)*Math.floor((e+5)/6)*16;case Zr:return Math.floor((a+9)/10)*Math.floor((e+7)/8)*16;case Qr:return Math.floor((a+9)/10)*Math.floor((e+9)/10)*16;case eo:return Math.floor((a+11)/12)*Math.floor((e+9)/10)*16;case to:return Math.floor((a+11)/12)*Math.floor((e+11)/12)*16;case no:case io:case ao:return Math.ceil(a/4)*Math.ceil(e/4)*16;case so:case ro:return Math.ceil(a/4)*Math.ceil(e/4)*8;case oo:case lo:return Math.ceil(a/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${n} format.`)}function id(a){switch(a){case un:case ml:return{byteLength:1,components:1};case ta:case gl:case na:return{byteLength:2,components:1};case Rr:case Pr:return{byteLength:2,components:4};case Kn:case Cr:case xn:return{byteLength:4,components:1};case yl:case xl:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${a}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"180"}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="180");/**
 * @license
 * Copyright 2010-2025 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function Zu(){let a=null,e=!1,n=null,i=null;function s(r,o){n(r,o),i=a.requestAnimationFrame(s)}return{start:function(){e!==!0&&n!==null&&(i=a.requestAnimationFrame(s),e=!0)},stop:function(){a.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(r){n=r},setContext:function(r){a=r}}}function cd(a){let e=new WeakMap;function n(l,u){let c=l.array,h=l.usage,f=c.byteLength,p=a.createBuffer();a.bindBuffer(u,p),a.bufferData(u,c,h),l.onUploadCallback();let g;if(c instanceof Float32Array)g=a.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)g=a.HALF_FLOAT;else if(c instanceof Uint16Array)l.isFloat16BufferAttribute?g=a.HALF_FLOAT:g=a.UNSIGNED_SHORT;else if(c instanceof Int16Array)g=a.SHORT;else if(c instanceof Uint32Array)g=a.UNSIGNED_INT;else if(c instanceof Int32Array)g=a.INT;else if(c instanceof Int8Array)g=a.BYTE;else if(c instanceof Uint8Array)g=a.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)g=a.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:p,type:g,bytesPerElement:c.BYTES_PER_ELEMENT,version:l.version,size:f}}function i(l,u,c){let h=u.array,f=u.updateRanges;if(a.bindBuffer(c,l),f.length===0)a.bufferSubData(c,0,h);else{f.sort((g,y)=>g.start-y.start);let p=0;for(let g=1;g<f.length;g++){let y=f[p],v=f[g];v.start<=y.start+y.count+1?y.count=Math.max(y.count,v.start+v.count-y.start):(++p,f[p]=v)}f.length=p+1;for(let g=0,y=f.length;g<y;g++){let v=f[g];a.bufferSubData(c,v.start*h.BYTES_PER_ELEMENT,h,v.start,v.count)}u.clearUpdateRanges()}u.onUploadCallback()}function s(l){return l.isInterleavedBufferAttribute&&(l=l.data),e.get(l)}function r(l){l.isInterleavedBufferAttribute&&(l=l.data);let u=e.get(l);u&&(a.deleteBuffer(u.buffer),e.delete(l))}function o(l,u){if(l.isInterleavedBufferAttribute&&(l=l.data),l.isGLBufferAttribute){let h=e.get(l);(!h||h.version<l.version)&&e.set(l,{buffer:l.buffer,type:l.type,bytesPerElement:l.elementSize,version:l.version});return}let c=e.get(l);if(c===void 0)e.set(l,n(l,u));else if(c.version<l.version){if(c.size!==l.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,l,u),c.version=l.version}}return{get:s,remove:r,update:o}}var ud=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,hd=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,dd=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,fd=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,pd=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,md=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,gd=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,yd=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,xd=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,_d=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,bd=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,vd=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Md=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Sd=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,wd=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Td=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Ed=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Ad=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,kd=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Cd=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Rd=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Pd=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,Id=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,Ld=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Dd=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Ud=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,Nd=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Fd=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Bd=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Od=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,zd="gl_FragColor = linearToOutputTexel( gl_FragColor );",Hd=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Vd=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,Gd=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,Wd=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Xd=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,qd=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,jd=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Yd=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,$d=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Kd=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Jd=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Zd=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Qd=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,ef=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,tf=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,nf=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,af=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,sf=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,rf=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,of=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,lf=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,cf=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,uf=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,hf=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,df=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,ff=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,pf=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,mf=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,gf=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,yf=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,xf=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,_f=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,bf=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,vf=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Mf=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Sf=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,wf=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Tf=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Ef=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Af=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,kf=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Cf=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Rf=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Pf=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,If=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Lf=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Df=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Uf=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Nf=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Ff=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Bf=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Of=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,zf=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Hf=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Vf=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Gf=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Wf=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Xf=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,qf=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		float depth = unpackRGBAToDepth( texture2D( depths, uv ) );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			return step( depth, compare );
		#else
			return step( compare, depth );
		#endif
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow( sampler2D shadow, vec2 uv, float compare ) {
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			float hard_shadow = step( distribution.x, compare );
		#else
			float hard_shadow = step( compare, distribution.x );
		#endif
		if ( hard_shadow != 1.0 ) {
			float distance = compare - distribution.x;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,jf=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Yf=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,$f=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Kf=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Jf=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Zf=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Qf=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,ep=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,tp=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,np=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,ip=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,ap=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,sp=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,rp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,op=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,lp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,cp=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,up=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,hp=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,dp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,fp=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,pp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,mp=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,gp=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,yp=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,xp=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,_p=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,bp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,vp=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Mp=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Sp=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,wp=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Tp=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Ep=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Ap=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,kp=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,Cp=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Rp=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Pp=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,Ip=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Lp=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Dp=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Up=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Np=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Fp=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Bp=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,Op=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,zp=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Hp=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Vp=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Gp=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Ge={alphahash_fragment:ud,alphahash_pars_fragment:hd,alphamap_fragment:dd,alphamap_pars_fragment:fd,alphatest_fragment:pd,alphatest_pars_fragment:md,aomap_fragment:gd,aomap_pars_fragment:yd,batching_pars_vertex:xd,batching_vertex:_d,begin_vertex:bd,beginnormal_vertex:vd,bsdfs:Md,iridescence_fragment:Sd,bumpmap_pars_fragment:wd,clipping_planes_fragment:Td,clipping_planes_pars_fragment:Ed,clipping_planes_pars_vertex:Ad,clipping_planes_vertex:kd,color_fragment:Cd,color_pars_fragment:Rd,color_pars_vertex:Pd,color_vertex:Id,common:Ld,cube_uv_reflection_fragment:Dd,defaultnormal_vertex:Ud,displacementmap_pars_vertex:Nd,displacementmap_vertex:Fd,emissivemap_fragment:Bd,emissivemap_pars_fragment:Od,colorspace_fragment:zd,colorspace_pars_fragment:Hd,envmap_fragment:Vd,envmap_common_pars_fragment:Gd,envmap_pars_fragment:Wd,envmap_pars_vertex:Xd,envmap_physical_pars_fragment:nf,envmap_vertex:qd,fog_vertex:jd,fog_pars_vertex:Yd,fog_fragment:$d,fog_pars_fragment:Kd,gradientmap_pars_fragment:Jd,lightmap_pars_fragment:Zd,lights_lambert_fragment:Qd,lights_lambert_pars_fragment:ef,lights_pars_begin:tf,lights_toon_fragment:af,lights_toon_pars_fragment:sf,lights_phong_fragment:rf,lights_phong_pars_fragment:of,lights_physical_fragment:lf,lights_physical_pars_fragment:cf,lights_fragment_begin:uf,lights_fragment_maps:hf,lights_fragment_end:df,logdepthbuf_fragment:ff,logdepthbuf_pars_fragment:pf,logdepthbuf_pars_vertex:mf,logdepthbuf_vertex:gf,map_fragment:yf,map_pars_fragment:xf,map_particle_fragment:_f,map_particle_pars_fragment:bf,metalnessmap_fragment:vf,metalnessmap_pars_fragment:Mf,morphinstance_vertex:Sf,morphcolor_vertex:wf,morphnormal_vertex:Tf,morphtarget_pars_vertex:Ef,morphtarget_vertex:Af,normal_fragment_begin:kf,normal_fragment_maps:Cf,normal_pars_fragment:Rf,normal_pars_vertex:Pf,normal_vertex:If,normalmap_pars_fragment:Lf,clearcoat_normal_fragment_begin:Df,clearcoat_normal_fragment_maps:Uf,clearcoat_pars_fragment:Nf,iridescence_pars_fragment:Ff,opaque_fragment:Bf,packing:Of,premultiplied_alpha_fragment:zf,project_vertex:Hf,dithering_fragment:Vf,dithering_pars_fragment:Gf,roughnessmap_fragment:Wf,roughnessmap_pars_fragment:Xf,shadowmap_pars_fragment:qf,shadowmap_pars_vertex:jf,shadowmap_vertex:Yf,shadowmask_pars_fragment:$f,skinbase_vertex:Kf,skinning_pars_vertex:Jf,skinning_vertex:Zf,skinnormal_vertex:Qf,specularmap_fragment:ep,specularmap_pars_fragment:tp,tonemapping_fragment:np,tonemapping_pars_fragment:ip,transmission_fragment:ap,transmission_pars_fragment:sp,uv_pars_fragment:rp,uv_pars_vertex:op,uv_vertex:lp,worldpos_vertex:cp,background_vert:up,background_frag:hp,backgroundCube_vert:dp,backgroundCube_frag:fp,cube_vert:pp,cube_frag:mp,depth_vert:gp,depth_frag:yp,distanceRGBA_vert:xp,distanceRGBA_frag:_p,equirect_vert:bp,equirect_frag:vp,linedashed_vert:Mp,linedashed_frag:Sp,meshbasic_vert:wp,meshbasic_frag:Tp,meshlambert_vert:Ep,meshlambert_frag:Ap,meshmatcap_vert:kp,meshmatcap_frag:Cp,meshnormal_vert:Rp,meshnormal_frag:Pp,meshphong_vert:Ip,meshphong_frag:Lp,meshphysical_vert:Dp,meshphysical_frag:Up,meshtoon_vert:Np,meshtoon_frag:Fp,points_vert:Bp,points_frag:Op,shadow_vert:zp,shadow_frag:Hp,sprite_vert:Vp,sprite_frag:Gp},ue={common:{diffuse:{value:new Oe(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new ze},alphaMap:{value:null},alphaMapTransform:{value:new ze},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new ze}},envmap:{envMap:{value:null},envMapRotation:{value:new ze},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new ze}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new ze}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new ze},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new ze},normalScale:{value:new Be(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new ze},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new ze}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new ze}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new ze}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Oe(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Oe(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new ze},alphaTest:{value:0},uvTransform:{value:new ze}},sprite:{diffuse:{value:new Oe(16777215)},opacity:{value:1},center:{value:new Be(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new ze},alphaMap:{value:null},alphaMapTransform:{value:new ze},alphaTest:{value:0}}},_n={basic:{uniforms:Dt([ue.common,ue.specularmap,ue.envmap,ue.aomap,ue.lightmap,ue.fog]),vertexShader:Ge.meshbasic_vert,fragmentShader:Ge.meshbasic_frag},lambert:{uniforms:Dt([ue.common,ue.specularmap,ue.envmap,ue.aomap,ue.lightmap,ue.emissivemap,ue.bumpmap,ue.normalmap,ue.displacementmap,ue.fog,ue.lights,{emissive:{value:new Oe(0)}}]),vertexShader:Ge.meshlambert_vert,fragmentShader:Ge.meshlambert_frag},phong:{uniforms:Dt([ue.common,ue.specularmap,ue.envmap,ue.aomap,ue.lightmap,ue.emissivemap,ue.bumpmap,ue.normalmap,ue.displacementmap,ue.fog,ue.lights,{emissive:{value:new Oe(0)},specular:{value:new Oe(1118481)},shininess:{value:30}}]),vertexShader:Ge.meshphong_vert,fragmentShader:Ge.meshphong_frag},standard:{uniforms:Dt([ue.common,ue.envmap,ue.aomap,ue.lightmap,ue.emissivemap,ue.bumpmap,ue.normalmap,ue.displacementmap,ue.roughnessmap,ue.metalnessmap,ue.fog,ue.lights,{emissive:{value:new Oe(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Ge.meshphysical_vert,fragmentShader:Ge.meshphysical_frag},toon:{uniforms:Dt([ue.common,ue.aomap,ue.lightmap,ue.emissivemap,ue.bumpmap,ue.normalmap,ue.displacementmap,ue.gradientmap,ue.fog,ue.lights,{emissive:{value:new Oe(0)}}]),vertexShader:Ge.meshtoon_vert,fragmentShader:Ge.meshtoon_frag},matcap:{uniforms:Dt([ue.common,ue.bumpmap,ue.normalmap,ue.displacementmap,ue.fog,{matcap:{value:null}}]),vertexShader:Ge.meshmatcap_vert,fragmentShader:Ge.meshmatcap_frag},points:{uniforms:Dt([ue.points,ue.fog]),vertexShader:Ge.points_vert,fragmentShader:Ge.points_frag},dashed:{uniforms:Dt([ue.common,ue.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Ge.linedashed_vert,fragmentShader:Ge.linedashed_frag},depth:{uniforms:Dt([ue.common,ue.displacementmap]),vertexShader:Ge.depth_vert,fragmentShader:Ge.depth_frag},normal:{uniforms:Dt([ue.common,ue.bumpmap,ue.normalmap,ue.displacementmap,{opacity:{value:1}}]),vertexShader:Ge.meshnormal_vert,fragmentShader:Ge.meshnormal_frag},sprite:{uniforms:Dt([ue.sprite,ue.fog]),vertexShader:Ge.sprite_vert,fragmentShader:Ge.sprite_frag},background:{uniforms:{uvTransform:{value:new ze},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Ge.background_vert,fragmentShader:Ge.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new ze}},vertexShader:Ge.backgroundCube_vert,fragmentShader:Ge.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Ge.cube_vert,fragmentShader:Ge.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Ge.equirect_vert,fragmentShader:Ge.equirect_frag},distanceRGBA:{uniforms:Dt([ue.common,ue.displacementmap,{referencePosition:{value:new U},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Ge.distanceRGBA_vert,fragmentShader:Ge.distanceRGBA_frag},shadow:{uniforms:Dt([ue.lights,ue.fog,{color:{value:new Oe(0)},opacity:{value:1}}]),vertexShader:Ge.shadow_vert,fragmentShader:Ge.shadow_frag}};_n.physical={uniforms:Dt([_n.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new ze},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new ze},clearcoatNormalScale:{value:new Be(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new ze},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new ze},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new ze},sheen:{value:0},sheenColor:{value:new Oe(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new ze},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new ze},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new ze},transmissionSamplerSize:{value:new Be},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new ze},attenuationDistance:{value:0},attenuationColor:{value:new Oe(0)},specularColor:{value:new Oe(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new ze},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new ze},anisotropyVector:{value:new Be},anisotropyMap:{value:null},anisotropyMapTransform:{value:new ze}}]),vertexShader:Ge.meshphysical_vert,fragmentShader:Ge.meshphysical_frag};var co={r:0,b:0,g:0},_i=new ln,Wp=new ot;function Xp(a,e,n,i,s,r,o){let l=new Oe(0),u=r===!0?0:1,c,h,f=null,p=0,g=null;function y(_){let x=_.isScene===!0?_.background:null;return x&&x.isTexture&&(x=(_.backgroundBlurriness>0?n:e).get(x)),x}function v(_){let x=!1,A=y(_);A===null?d(l,u):A&&A.isColor&&(d(A,1),x=!0);let E=a.xr.getEnvironmentBlendMode();E==="additive"?i.buffers.color.setClear(0,0,0,1,o):E==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,o),(a.autoClear||x)&&(i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),a.clear(a.autoClearColor,a.autoClearDepth,a.autoClearStencil))}function m(_,x){let A=y(x);A&&(A.isCubeTexture||A.mapping===Za)?(h===void 0&&(h=new yt(new Lt(1,1,1),new cn({name:"BackgroundCubeMaterial",uniforms:xi(_n.backgroundCube.uniforms),vertexShader:_n.backgroundCube.vertexShader,fragmentShader:_n.backgroundCube.fragmentShader,side:Bt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(E,C,P){this.matrixWorld.copyPosition(P.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(h)),_i.copy(x.backgroundRotation),_i.x*=-1,_i.y*=-1,_i.z*=-1,A.isCubeTexture&&A.isRenderTargetTexture===!1&&(_i.y*=-1,_i.z*=-1),h.material.uniforms.envMap.value=A,h.material.uniforms.flipEnvMap.value=A.isCubeTexture&&A.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=x.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=x.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(Wp.makeRotationFromEuler(_i)),h.material.toneMapped=Ye.getTransfer(A.colorSpace)!==nt,(f!==A||p!==A.version||g!==a.toneMapping)&&(h.material.needsUpdate=!0,f=A,p=A.version,g=a.toneMapping),h.layers.enableAll(),_.unshift(h,h.geometry,h.material,0,0,null)):A&&A.isTexture&&(c===void 0&&(c=new yt(new pi(2,2),new cn({name:"BackgroundMaterial",uniforms:xi(_n.background.uniforms),vertexShader:_n.background.vertexShader,fragmentShader:_n.background.fragmentShader,side:Cn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c)),c.material.uniforms.t2D.value=A,c.material.uniforms.backgroundIntensity.value=x.backgroundIntensity,c.material.toneMapped=Ye.getTransfer(A.colorSpace)!==nt,A.matrixAutoUpdate===!0&&A.updateMatrix(),c.material.uniforms.uvTransform.value.copy(A.matrix),(f!==A||p!==A.version||g!==a.toneMapping)&&(c.material.needsUpdate=!0,f=A,p=A.version,g=a.toneMapping),c.layers.enableAll(),_.unshift(c,c.geometry,c.material,0,0,null))}function d(_,x){_.getRGB(co,Al(a)),i.buffers.color.setClear(co.r,co.g,co.b,x,o)}function T(){h!==void 0&&(h.geometry.dispose(),h.material.dispose(),h=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return l},setClearColor:function(_,x=1){l.set(_),u=x,d(l,u)},getClearAlpha:function(){return u},setClearAlpha:function(_){u=_,d(l,u)},render:v,addToRenderList:m,dispose:T}}function qp(a,e){let n=a.getParameter(a.MAX_VERTEX_ATTRIBS),i={},s=p(null),r=s,o=!1;function l(w,I,D,z,H){let j=!1,W=f(z,D,I);r!==W&&(r=W,c(r.object)),j=g(w,z,D,H),j&&y(w,z,D,H),H!==null&&e.update(H,a.ELEMENT_ARRAY_BUFFER),(j||o)&&(o=!1,x(w,I,D,z),H!==null&&a.bindBuffer(a.ELEMENT_ARRAY_BUFFER,e.get(H).buffer))}function u(){return a.createVertexArray()}function c(w){return a.bindVertexArray(w)}function h(w){return a.deleteVertexArray(w)}function f(w,I,D){let z=D.wireframe===!0,H=i[w.id];H===void 0&&(H={},i[w.id]=H);let j=H[I.id];j===void 0&&(j={},H[I.id]=j);let W=j[z];return W===void 0&&(W=p(u()),j[z]=W),W}function p(w){let I=[],D=[],z=[];for(let H=0;H<n;H++)I[H]=0,D[H]=0,z[H]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:I,enabledAttributes:D,attributeDivisors:z,object:w,attributes:{},index:null}}function g(w,I,D,z){let H=r.attributes,j=I.attributes,W=0,ne=D.getAttributes();for(let X in ne)if(ne[X].location>=0){let le=H[X],pe=j[X];if(pe===void 0&&(X==="instanceMatrix"&&w.instanceMatrix&&(pe=w.instanceMatrix),X==="instanceColor"&&w.instanceColor&&(pe=w.instanceColor)),le===void 0||le.attribute!==pe||pe&&le.data!==pe.data)return!0;W++}return r.attributesNum!==W||r.index!==z}function y(w,I,D,z){let H={},j=I.attributes,W=0,ne=D.getAttributes();for(let X in ne)if(ne[X].location>=0){let le=j[X];le===void 0&&(X==="instanceMatrix"&&w.instanceMatrix&&(le=w.instanceMatrix),X==="instanceColor"&&w.instanceColor&&(le=w.instanceColor));let pe={};pe.attribute=le,le&&le.data&&(pe.data=le.data),H[X]=pe,W++}r.attributes=H,r.attributesNum=W,r.index=z}function v(){let w=r.newAttributes;for(let I=0,D=w.length;I<D;I++)w[I]=0}function m(w){d(w,0)}function d(w,I){let D=r.newAttributes,z=r.enabledAttributes,H=r.attributeDivisors;D[w]=1,z[w]===0&&(a.enableVertexAttribArray(w),z[w]=1),H[w]!==I&&(a.vertexAttribDivisor(w,I),H[w]=I)}function T(){let w=r.newAttributes,I=r.enabledAttributes;for(let D=0,z=I.length;D<z;D++)I[D]!==w[D]&&(a.disableVertexAttribArray(D),I[D]=0)}function _(w,I,D,z,H,j,W){W===!0?a.vertexAttribIPointer(w,I,D,H,j):a.vertexAttribPointer(w,I,D,z,H,j)}function x(w,I,D,z){v();let H=z.attributes,j=D.getAttributes(),W=I.defaultAttributeValues;for(let ne in j){let X=j[ne];if(X.location>=0){let re=H[ne];if(re===void 0&&(ne==="instanceMatrix"&&w.instanceMatrix&&(re=w.instanceMatrix),ne==="instanceColor"&&w.instanceColor&&(re=w.instanceColor)),re!==void 0){let le=re.normalized,pe=re.itemSize,Le=e.get(re);if(Le===void 0)continue;let et=Le.buffer,st=Le.type,qe=Le.bytesPerElement,K=st===a.INT||st===a.UNSIGNED_INT||re.gpuType===Cr;if(re.isInterleavedBufferAttribute){let Z=re.data,xe=Z.stride,Ue=re.offset;if(Z.isInstancedInterleavedBuffer){for(let se=0;se<X.locationSize;se++)d(X.location+se,Z.meshPerAttribute);w.isInstancedMesh!==!0&&z._maxInstanceCount===void 0&&(z._maxInstanceCount=Z.meshPerAttribute*Z.count)}else for(let se=0;se<X.locationSize;se++)m(X.location+se);a.bindBuffer(a.ARRAY_BUFFER,et);for(let se=0;se<X.locationSize;se++)_(X.location+se,pe/X.locationSize,st,le,xe*qe,(Ue+pe/X.locationSize*se)*qe,K)}else{if(re.isInstancedBufferAttribute){for(let Z=0;Z<X.locationSize;Z++)d(X.location+Z,re.meshPerAttribute);w.isInstancedMesh!==!0&&z._maxInstanceCount===void 0&&(z._maxInstanceCount=re.meshPerAttribute*re.count)}else for(let Z=0;Z<X.locationSize;Z++)m(X.location+Z);a.bindBuffer(a.ARRAY_BUFFER,et);for(let Z=0;Z<X.locationSize;Z++)_(X.location+Z,pe/X.locationSize,st,le,pe*qe,pe/X.locationSize*Z*qe,K)}}else if(W!==void 0){let le=W[ne];if(le!==void 0)switch(le.length){case 2:a.vertexAttrib2fv(X.location,le);break;case 3:a.vertexAttrib3fv(X.location,le);break;case 4:a.vertexAttrib4fv(X.location,le);break;default:a.vertexAttrib1fv(X.location,le)}}}}T()}function A(){P();for(let w in i){let I=i[w];for(let D in I){let z=I[D];for(let H in z)h(z[H].object),delete z[H];delete I[D]}delete i[w]}}function E(w){if(i[w.id]===void 0)return;let I=i[w.id];for(let D in I){let z=I[D];for(let H in z)h(z[H].object),delete z[H];delete I[D]}delete i[w.id]}function C(w){for(let I in i){let D=i[I];if(D[w.id]===void 0)continue;let z=D[w.id];for(let H in z)h(z[H].object),delete z[H];delete D[w.id]}}function P(){M(),o=!0,r!==s&&(r=s,c(r.object))}function M(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:l,reset:P,resetDefaultState:M,dispose:A,releaseStatesOfGeometry:E,releaseStatesOfProgram:C,initAttributes:v,enableAttribute:m,disableUnusedAttributes:T}}function jp(a,e,n){let i;function s(c){i=c}function r(c,h){a.drawArrays(i,c,h),n.update(h,i,1)}function o(c,h,f){f!==0&&(a.drawArraysInstanced(i,c,h,f),n.update(h,i,f))}function l(c,h,f){if(f===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,c,0,h,0,f);let g=0;for(let y=0;y<f;y++)g+=h[y];n.update(g,i,1)}function u(c,h,f,p){if(f===0)return;let g=e.get("WEBGL_multi_draw");if(g===null)for(let y=0;y<c.length;y++)o(c[y],h[y],p[y]);else{g.multiDrawArraysInstancedWEBGL(i,c,0,h,0,p,0,f);let y=0;for(let v=0;v<f;v++)y+=h[v]*p[v];n.update(y,i,1)}}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=l,this.renderMultiDrawInstances=u}function Yp(a,e,n,i){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){let C=e.get("EXT_texture_filter_anisotropic");s=a.getParameter(C.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(C){return!(C!==en&&i.convert(C)!==a.getParameter(a.IMPLEMENTATION_COLOR_READ_FORMAT))}function l(C){let P=C===na&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(C!==un&&i.convert(C)!==a.getParameter(a.IMPLEMENTATION_COLOR_READ_TYPE)&&C!==xn&&!P)}function u(C){if(C==="highp"){if(a.getShaderPrecisionFormat(a.VERTEX_SHADER,a.HIGH_FLOAT).precision>0&&a.getShaderPrecisionFormat(a.FRAGMENT_SHADER,a.HIGH_FLOAT).precision>0)return"highp";C="mediump"}return C==="mediump"&&a.getShaderPrecisionFormat(a.VERTEX_SHADER,a.MEDIUM_FLOAT).precision>0&&a.getShaderPrecisionFormat(a.FRAGMENT_SHADER,a.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=n.precision!==void 0?n.precision:"highp",h=u(c);h!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);let f=n.logarithmicDepthBuffer===!0,p=n.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),g=a.getParameter(a.MAX_TEXTURE_IMAGE_UNITS),y=a.getParameter(a.MAX_VERTEX_TEXTURE_IMAGE_UNITS),v=a.getParameter(a.MAX_TEXTURE_SIZE),m=a.getParameter(a.MAX_CUBE_MAP_TEXTURE_SIZE),d=a.getParameter(a.MAX_VERTEX_ATTRIBS),T=a.getParameter(a.MAX_VERTEX_UNIFORM_VECTORS),_=a.getParameter(a.MAX_VARYING_VECTORS),x=a.getParameter(a.MAX_FRAGMENT_UNIFORM_VECTORS),A=y>0,E=a.getParameter(a.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:u,textureFormatReadable:o,textureTypeReadable:l,precision:c,logarithmicDepthBuffer:f,reversedDepthBuffer:p,maxTextures:g,maxVertexTextures:y,maxTextureSize:v,maxCubemapSize:m,maxAttributes:d,maxVertexUniforms:T,maxVaryings:_,maxFragmentUniforms:x,vertexTextures:A,maxSamples:E}}function $p(a){let e=this,n=null,i=0,s=!1,r=!1,o=new dn,l=new ze,u={value:null,needsUpdate:!1};this.uniform=u,this.numPlanes=0,this.numIntersection=0,this.init=function(f,p){let g=f.length!==0||p||i!==0||s;return s=p,i=f.length,g},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(f,p){n=h(f,p,0)},this.setState=function(f,p,g){let y=f.clippingPlanes,v=f.clipIntersection,m=f.clipShadows,d=a.get(f);if(!s||y===null||y.length===0||r&&!m)r?h(null):c();else{let T=r?0:i,_=T*4,x=d.clippingState||null;u.value=x,x=h(y,p,_,g);for(let A=0;A!==_;++A)x[A]=n[A];d.clippingState=x,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=T}};function c(){u.value!==n&&(u.value=n,u.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function h(f,p,g,y){let v=f!==null?f.length:0,m=null;if(v!==0){if(m=u.value,y!==!0||m===null){let d=g+v*4,T=p.matrixWorldInverse;l.getNormalMatrix(T),(m===null||m.length<d)&&(m=new Float32Array(d));for(let _=0,x=g;_!==v;++_,x+=4)o.copy(f[_]).applyMatrix4(T,l),o.normal.toArray(m,x),m[x+3]=o.constant}u.value=m,u.needsUpdate=!0}return e.numPlanes=v,e.numIntersection=0,m}}function Kp(a){let e=new WeakMap;function n(o,l){return l===Er?o.mapping=gi:l===Ar&&(o.mapping=yi),o}function i(o){if(o&&o.isTexture){let l=o.mapping;if(l===Er||l===Ar)if(e.has(o)){let u=e.get(o).texture;return n(u,o.mapping)}else{let u=o.image;if(u&&u.height>0){let c=new Qs(u.height);return c.fromEquirectangularTexture(a,o),e.set(o,c),o.addEventListener("dispose",s),n(c.texture,o.mapping)}else return null}}return o}function s(o){let l=o.target;l.removeEventListener("dispose",s);let u=e.get(l);u!==void 0&&(e.delete(l),u.dispose())}function r(){e=new WeakMap}return{get:i,dispose:r}}var ra=4,Cu=[.125,.215,.35,.446,.526,.582],Mi=20,Pl=new Ya,Ru=new Oe,Il=null,Ll=0,Dl=0,Ul=!1,vi=(1+Math.sqrt(5))/2,sa=1/vi,Pu=[new U(-vi,sa,0),new U(vi,sa,0),new U(-sa,0,vi),new U(sa,0,vi),new U(0,vi,-sa),new U(0,vi,sa),new U(-1,1,-1),new U(1,1,-1),new U(-1,1,1),new U(1,1,1)],Jp=new U,fo=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,n=0,i=.1,s=100,r={}){let{size:o=256,position:l=Jp}=r;Il=this._renderer.getRenderTarget(),Ll=this._renderer.getActiveCubeFace(),Dl=this._renderer.getActiveMipmapLevel(),Ul=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);let u=this._allocateTargets();return u.depthBuffer=!0,this._sceneToCubeUV(e,i,s,u,l),n>0&&this._blur(u,0,0,n),this._applyPMREM(u),this._cleanup(u),u}fromEquirectangular(e,n=null){return this._fromTexture(e,n)}fromCubemap(e,n=null){return this._fromTexture(e,n)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Du(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Lu(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Il,Ll,Dl),this._renderer.xr.enabled=Ul,e.scissorTest=!1,uo(e,0,0,e.width,e.height)}_fromTexture(e,n){e.mapping===gi||e.mapping===yi?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Il=this._renderer.getRenderTarget(),Ll=this._renderer.getActiveCubeFace(),Dl=this._renderer.getActiveMipmapLevel(),Ul=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let i=n||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),n=4*this._cubeSize,i={magFilter:on,minFilter:on,generateMipmaps:!1,type:na,format:en,colorSpace:ui,depthBuffer:!1},s=Iu(e,n,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==n){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Iu(e,n,i);let{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=Zp(r)),this._blurMaterial=Qp(r,e,n)}return s}_compileMaterial(e){let n=new yt(this._lodPlanes[0],e);this._renderer.compile(n,Pl)}_sceneToCubeUV(e,n,i,s,r){let u=new Pt(90,1,n,i),c=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],f=this._renderer,p=f.autoClear,g=f.toneMapping;f.getClearColor(Ru),f.toneMapping=Ln,f.autoClear=!1,f.state.buffers.depth.getReversed()&&(f.setRenderTarget(s),f.clearDepth(),f.setRenderTarget(null));let v=new Xn({name:"PMREM.Background",side:Bt,depthWrite:!1,depthTest:!1}),m=new yt(new Lt,v),d=!1,T=e.background;T?T.isColor&&(v.color.copy(T),e.background=null,d=!0):(v.color.copy(Ru),d=!0);for(let _=0;_<6;_++){let x=_%3;x===0?(u.up.set(0,c[_],0),u.position.set(r.x,r.y,r.z),u.lookAt(r.x+h[_],r.y,r.z)):x===1?(u.up.set(0,0,c[_]),u.position.set(r.x,r.y,r.z),u.lookAt(r.x,r.y+h[_],r.z)):(u.up.set(0,c[_],0),u.position.set(r.x,r.y,r.z),u.lookAt(r.x,r.y,r.z+h[_]));let A=this._cubeSize;uo(s,x*A,_>2?A:0,A,A),f.setRenderTarget(s),d&&f.render(m,u),f.render(e,u)}m.geometry.dispose(),m.material.dispose(),f.toneMapping=g,f.autoClear=p,e.background=T}_textureToCubeUV(e,n){let i=this._renderer,s=e.mapping===gi||e.mapping===yi;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Du()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Lu());let r=s?this._cubemapMaterial:this._equirectMaterial,o=new yt(this._lodPlanes[0],r),l=r.uniforms;l.envMap.value=e;let u=this._cubeSize;uo(n,0,0,3*u,2*u),i.setRenderTarget(n),i.render(o,Pl)}_applyPMREM(e){let n=this._renderer,i=n.autoClear;n.autoClear=!1;let s=this._lodPlanes.length;for(let r=1;r<s;r++){let o=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),l=Pu[(s-r-1)%Pu.length];this._blur(e,r-1,r,o,l)}n.autoClear=i}_blur(e,n,i,s,r){let o=this._pingPongRenderTarget;this._halfBlur(e,o,n,i,s,"latitudinal",r),this._halfBlur(o,e,i,i,s,"longitudinal",r)}_halfBlur(e,n,i,s,r,o,l){let u=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");let h=3,f=new yt(this._lodPlanes[s],c),p=c.uniforms,g=this._sizeLods[i]-1,y=isFinite(r)?Math.PI/(2*g):2*Math.PI/(2*Mi-1),v=r/y,m=isFinite(r)?1+Math.floor(h*v):Mi;m>Mi&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${Mi}`);let d=[],T=0;for(let C=0;C<Mi;++C){let P=C/v,M=Math.exp(-P*P/2);d.push(M),C===0?T+=M:C<m&&(T+=2*M)}for(let C=0;C<d.length;C++)d[C]=d[C]/T;p.envMap.value=e.texture,p.samples.value=m,p.weights.value=d,p.latitudinal.value=o==="latitudinal",l&&(p.poleAxis.value=l);let{_lodMax:_}=this;p.dTheta.value=y,p.mipInt.value=_-i;let x=this._sizeLods[s],A=3*x*(s>_-ra?s-_+ra:0),E=4*(this._cubeSize-x);uo(n,A,E,3*x,2*x),u.setRenderTarget(n),u.render(f,Pl)}};function Zp(a){let e=[],n=[],i=[],s=a,r=a-ra+1+Cu.length;for(let o=0;o<r;o++){let l=Math.pow(2,s);n.push(l);let u=1/l;o>a-ra?u=Cu[o-a+ra-1]:o===0&&(u=0),i.push(u);let c=1/(l-2),h=-c,f=1+c,p=[h,h,f,h,f,f,h,h,f,f,h,f],g=6,y=6,v=3,m=2,d=1,T=new Float32Array(v*y*g),_=new Float32Array(m*y*g),x=new Float32Array(d*y*g);for(let E=0;E<g;E++){let C=E%3*2/3-1,P=E>2?0:-1,M=[C,P,0,C+2/3,P,0,C+2/3,P+1,0,C,P,0,C+2/3,P+1,0,C,P+1,0];T.set(M,v*y*E),_.set(p,m*y*E);let w=[E,E,E,E,E,E];x.set(w,d*y*E)}let A=new Ft;A.setAttribute("position",new It(T,v)),A.setAttribute("uv",new It(_,m)),A.setAttribute("faceIndex",new It(x,d)),e.push(A),s>ra&&s--}return{lodPlanes:e,sizeLods:n,sigmas:i}}function Iu(a,e,n){let i=new mn(a,e,n);return i.texture.mapping=Za,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function uo(a,e,n,i,s){a.viewport.set(e,n,i,s),a.scissor.set(e,n,i,s)}function Qp(a,e,n){let i=new Float32Array(Mi),s=new U(0,1,0);return new cn({name:"SphericalGaussianBlur",defines:{n:Mi,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${a}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:Xl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:In,depthTest:!1,depthWrite:!1})}function Lu(){return new cn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Xl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:In,depthTest:!1,depthWrite:!1})}function Du(){return new cn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Xl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:In,depthTest:!1,depthWrite:!1})}function Xl(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function em(a){let e=new WeakMap,n=null;function i(l){if(l&&l.isTexture){let u=l.mapping,c=u===Er||u===Ar,h=u===gi||u===yi;if(c||h){let f=e.get(l),p=f!==void 0?f.texture.pmremVersion:0;if(l.isRenderTargetTexture&&l.pmremVersion!==p)return n===null&&(n=new fo(a)),f=c?n.fromEquirectangular(l,f):n.fromCubemap(l,f),f.texture.pmremVersion=l.pmremVersion,e.set(l,f),f.texture;if(f!==void 0)return f.texture;{let g=l.image;return c&&g&&g.height>0||h&&g&&s(g)?(n===null&&(n=new fo(a)),f=c?n.fromEquirectangular(l):n.fromCubemap(l),f.texture.pmremVersion=l.pmremVersion,e.set(l,f),l.addEventListener("dispose",r),f.texture):null}}}return l}function s(l){let u=0,c=6;for(let h=0;h<c;h++)l[h]!==void 0&&u++;return u===c}function r(l){let u=l.target;u.removeEventListener("dispose",r);let c=e.get(u);c!==void 0&&(e.delete(u),c.dispose())}function o(){e=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:i,dispose:o}}function tm(a){let e={};function n(i){if(e[i]!==void 0)return e[i];let s;switch(i){case"WEBGL_depth_texture":s=a.getExtension("WEBGL_depth_texture")||a.getExtension("MOZ_WEBGL_depth_texture")||a.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=a.getExtension("EXT_texture_filter_anisotropic")||a.getExtension("MOZ_EXT_texture_filter_anisotropic")||a.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=a.getExtension("WEBGL_compressed_texture_s3tc")||a.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||a.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=a.getExtension("WEBGL_compressed_texture_pvrtc")||a.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=a.getExtension(i)}return e[i]=s,s}return{has:function(i){return n(i)!==null},init:function(){n("EXT_color_buffer_float"),n("WEBGL_clip_cull_distance"),n("OES_texture_float_linear"),n("EXT_color_buffer_half_float"),n("WEBGL_multisampled_render_to_texture"),n("WEBGL_render_shared_exponent")},get:function(i){let s=n(i);return s===null&&qi("THREE.WebGLRenderer: "+i+" extension not supported."),s}}}function nm(a,e,n,i){let s={},r=new WeakMap;function o(f){let p=f.target;p.index!==null&&e.remove(p.index);for(let y in p.attributes)e.remove(p.attributes[y]);p.removeEventListener("dispose",o),delete s[p.id];let g=r.get(p);g&&(e.remove(g),r.delete(p)),i.releaseStatesOfGeometry(p),p.isInstancedBufferGeometry===!0&&delete p._maxInstanceCount,n.memory.geometries--}function l(f,p){return s[p.id]===!0||(p.addEventListener("dispose",o),s[p.id]=!0,n.memory.geometries++),p}function u(f){let p=f.attributes;for(let g in p)e.update(p[g],a.ARRAY_BUFFER)}function c(f){let p=[],g=f.index,y=f.attributes.position,v=0;if(g!==null){let T=g.array;v=g.version;for(let _=0,x=T.length;_<x;_+=3){let A=T[_+0],E=T[_+1],C=T[_+2];p.push(A,E,E,C,C,A)}}else if(y!==void 0){let T=y.array;v=y.version;for(let _=0,x=T.length/3-1;_<x;_+=3){let A=_+0,E=_+1,C=_+2;p.push(A,E,E,C,C,A)}}else return;let m=new(El(p)?La:Ia)(p,1);m.version=v;let d=r.get(f);d&&e.remove(d),r.set(f,m)}function h(f){let p=r.get(f);if(p){let g=f.index;g!==null&&p.version<g.version&&c(f)}else c(f);return r.get(f)}return{get:l,update:u,getWireframeAttribute:h}}function im(a,e,n){let i;function s(p){i=p}let r,o;function l(p){r=p.type,o=p.bytesPerElement}function u(p,g){a.drawElements(i,g,r,p*o),n.update(g,i,1)}function c(p,g,y){y!==0&&(a.drawElementsInstanced(i,g,r,p*o,y),n.update(g,i,y))}function h(p,g,y){if(y===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,g,0,r,p,0,y);let m=0;for(let d=0;d<y;d++)m+=g[d];n.update(m,i,1)}function f(p,g,y,v){if(y===0)return;let m=e.get("WEBGL_multi_draw");if(m===null)for(let d=0;d<p.length;d++)c(p[d]/o,g[d],v[d]);else{m.multiDrawElementsInstancedWEBGL(i,g,0,r,p,0,v,0,y);let d=0;for(let T=0;T<y;T++)d+=g[T]*v[T];n.update(d,i,1)}}this.setMode=s,this.setIndex=l,this.render=u,this.renderInstances=c,this.renderMultiDraw=h,this.renderMultiDrawInstances=f}function am(a){let e={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,o,l){switch(n.calls++,o){case a.TRIANGLES:n.triangles+=l*(r/3);break;case a.LINES:n.lines+=l*(r/2);break;case a.LINE_STRIP:n.lines+=l*(r-1);break;case a.LINE_LOOP:n.lines+=l*r;break;case a.POINTS:n.points+=l*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function s(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:e,render:n,programs:null,autoReset:!0,reset:s,update:i}}function sm(a,e,n){let i=new WeakMap,s=new gt;function r(o,l,u){let c=o.morphTargetInfluences,h=l.morphAttributes.position||l.morphAttributes.normal||l.morphAttributes.color,f=h!==void 0?h.length:0,p=i.get(l);if(p===void 0||p.count!==f){let M=function(){C.dispose(),i.delete(l),l.removeEventListener("dispose",M)};p!==void 0&&p.texture.dispose();let g=l.morphAttributes.position!==void 0,y=l.morphAttributes.normal!==void 0,v=l.morphAttributes.color!==void 0,m=l.morphAttributes.position||[],d=l.morphAttributes.normal||[],T=l.morphAttributes.color||[],_=0;g===!0&&(_=1),y===!0&&(_=2),v===!0&&(_=3);let x=l.attributes.position.count*_,A=1;x>e.maxTextureSize&&(A=Math.ceil(x/e.maxTextureSize),x=e.maxTextureSize);let E=new Float32Array(x*A*4*f),C=new Pa(E,x,A,f);C.type=xn,C.needsUpdate=!0;let P=_*4;for(let w=0;w<f;w++){let I=m[w],D=d[w],z=T[w],H=x*A*4*w;for(let j=0;j<I.count;j++){let W=j*P;g===!0&&(s.fromBufferAttribute(I,j),E[H+W+0]=s.x,E[H+W+1]=s.y,E[H+W+2]=s.z,E[H+W+3]=0),y===!0&&(s.fromBufferAttribute(D,j),E[H+W+4]=s.x,E[H+W+5]=s.y,E[H+W+6]=s.z,E[H+W+7]=0),v===!0&&(s.fromBufferAttribute(z,j),E[H+W+8]=s.x,E[H+W+9]=s.y,E[H+W+10]=s.z,E[H+W+11]=z.itemSize===4?s.w:1)}}p={count:f,texture:C,size:new Be(x,A)},i.set(l,p),l.addEventListener("dispose",M)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)u.getUniforms().setValue(a,"morphTexture",o.morphTexture,n);else{let g=0;for(let v=0;v<c.length;v++)g+=c[v];let y=l.morphTargetsRelative?1:1-g;u.getUniforms().setValue(a,"morphTargetBaseInfluence",y),u.getUniforms().setValue(a,"morphTargetInfluences",c)}u.getUniforms().setValue(a,"morphTargetsTexture",p.texture,n),u.getUniforms().setValue(a,"morphTargetsTextureSize",p.size)}return{update:r}}function rm(a,e,n,i){let s=new WeakMap;function r(u){let c=i.render.frame,h=u.geometry,f=e.get(u,h);if(s.get(f)!==c&&(e.update(f),s.set(f,c)),u.isInstancedMesh&&(u.hasEventListener("dispose",l)===!1&&u.addEventListener("dispose",l),s.get(u)!==c&&(n.update(u.instanceMatrix,a.ARRAY_BUFFER),u.instanceColor!==null&&n.update(u.instanceColor,a.ARRAY_BUFFER),s.set(u,c))),u.isSkinnedMesh){let p=u.skeleton;s.get(p)!==c&&(p.update(),s.set(p,c))}return f}function o(){s=new WeakMap}function l(u){let c=u.target;c.removeEventListener("dispose",l),n.remove(c.instanceMatrix),c.instanceColor!==null&&n.remove(c.instanceColor)}return{update:r,dispose:o}}var Qu=new zt,Uu=new za(1,1),eh=new Pa,th=new Js,nh=new Ua,Nu=[],Fu=[],Bu=new Float32Array(16),Ou=new Float32Array(9),zu=new Float32Array(4);function la(a,e,n){let i=a[0];if(i<=0||i>0)return a;let s=e*n,r=Nu[s];if(r===void 0&&(r=new Float32Array(s),Nu[s]=r),e!==0){i.toArray(r,0);for(let o=1,l=0;o!==e;++o)l+=n,a[o].toArray(r,l)}return r}function Mt(a,e){if(a.length!==e.length)return!1;for(let n=0,i=a.length;n<i;n++)if(a[n]!==e[n])return!1;return!0}function St(a,e){for(let n=0,i=e.length;n<i;n++)a[n]=e[n]}function mo(a,e){let n=Fu[e];n===void 0&&(n=new Int32Array(e),Fu[e]=n);for(let i=0;i!==e;++i)n[i]=a.allocateTextureUnit();return n}function om(a,e){let n=this.cache;n[0]!==e&&(a.uniform1f(this.addr,e),n[0]=e)}function lm(a,e){let n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y)&&(a.uniform2f(this.addr,e.x,e.y),n[0]=e.x,n[1]=e.y);else{if(Mt(n,e))return;a.uniform2fv(this.addr,e),St(n,e)}}function cm(a,e){let n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z)&&(a.uniform3f(this.addr,e.x,e.y,e.z),n[0]=e.x,n[1]=e.y,n[2]=e.z);else if(e.r!==void 0)(n[0]!==e.r||n[1]!==e.g||n[2]!==e.b)&&(a.uniform3f(this.addr,e.r,e.g,e.b),n[0]=e.r,n[1]=e.g,n[2]=e.b);else{if(Mt(n,e))return;a.uniform3fv(this.addr,e),St(n,e)}}function um(a,e){let n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z||n[3]!==e.w)&&(a.uniform4f(this.addr,e.x,e.y,e.z,e.w),n[0]=e.x,n[1]=e.y,n[2]=e.z,n[3]=e.w);else{if(Mt(n,e))return;a.uniform4fv(this.addr,e),St(n,e)}}function hm(a,e){let n=this.cache,i=e.elements;if(i===void 0){if(Mt(n,e))return;a.uniformMatrix2fv(this.addr,!1,e),St(n,e)}else{if(Mt(n,i))return;zu.set(i),a.uniformMatrix2fv(this.addr,!1,zu),St(n,i)}}function dm(a,e){let n=this.cache,i=e.elements;if(i===void 0){if(Mt(n,e))return;a.uniformMatrix3fv(this.addr,!1,e),St(n,e)}else{if(Mt(n,i))return;Ou.set(i),a.uniformMatrix3fv(this.addr,!1,Ou),St(n,i)}}function fm(a,e){let n=this.cache,i=e.elements;if(i===void 0){if(Mt(n,e))return;a.uniformMatrix4fv(this.addr,!1,e),St(n,e)}else{if(Mt(n,i))return;Bu.set(i),a.uniformMatrix4fv(this.addr,!1,Bu),St(n,i)}}function pm(a,e){let n=this.cache;n[0]!==e&&(a.uniform1i(this.addr,e),n[0]=e)}function mm(a,e){let n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y)&&(a.uniform2i(this.addr,e.x,e.y),n[0]=e.x,n[1]=e.y);else{if(Mt(n,e))return;a.uniform2iv(this.addr,e),St(n,e)}}function gm(a,e){let n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z)&&(a.uniform3i(this.addr,e.x,e.y,e.z),n[0]=e.x,n[1]=e.y,n[2]=e.z);else{if(Mt(n,e))return;a.uniform3iv(this.addr,e),St(n,e)}}function ym(a,e){let n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z||n[3]!==e.w)&&(a.uniform4i(this.addr,e.x,e.y,e.z,e.w),n[0]=e.x,n[1]=e.y,n[2]=e.z,n[3]=e.w);else{if(Mt(n,e))return;a.uniform4iv(this.addr,e),St(n,e)}}function xm(a,e){let n=this.cache;n[0]!==e&&(a.uniform1ui(this.addr,e),n[0]=e)}function _m(a,e){let n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y)&&(a.uniform2ui(this.addr,e.x,e.y),n[0]=e.x,n[1]=e.y);else{if(Mt(n,e))return;a.uniform2uiv(this.addr,e),St(n,e)}}function bm(a,e){let n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z)&&(a.uniform3ui(this.addr,e.x,e.y,e.z),n[0]=e.x,n[1]=e.y,n[2]=e.z);else{if(Mt(n,e))return;a.uniform3uiv(this.addr,e),St(n,e)}}function vm(a,e){let n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z||n[3]!==e.w)&&(a.uniform4ui(this.addr,e.x,e.y,e.z,e.w),n[0]=e.x,n[1]=e.y,n[2]=e.z,n[3]=e.w);else{if(Mt(n,e))return;a.uniform4uiv(this.addr,e),St(n,e)}}function Mm(a,e,n){let i=this.cache,s=n.allocateTextureUnit();i[0]!==s&&(a.uniform1i(this.addr,s),i[0]=s);let r;this.type===a.SAMPLER_2D_SHADOW?(Uu.compareFunction=wl,r=Uu):r=Qu,n.setTexture2D(e||r,s)}function Sm(a,e,n){let i=this.cache,s=n.allocateTextureUnit();i[0]!==s&&(a.uniform1i(this.addr,s),i[0]=s),n.setTexture3D(e||th,s)}function wm(a,e,n){let i=this.cache,s=n.allocateTextureUnit();i[0]!==s&&(a.uniform1i(this.addr,s),i[0]=s),n.setTextureCube(e||nh,s)}function Tm(a,e,n){let i=this.cache,s=n.allocateTextureUnit();i[0]!==s&&(a.uniform1i(this.addr,s),i[0]=s),n.setTexture2DArray(e||eh,s)}function Em(a){switch(a){case 5126:return om;case 35664:return lm;case 35665:return cm;case 35666:return um;case 35674:return hm;case 35675:return dm;case 35676:return fm;case 5124:case 35670:return pm;case 35667:case 35671:return mm;case 35668:case 35672:return gm;case 35669:case 35673:return ym;case 5125:return xm;case 36294:return _m;case 36295:return bm;case 36296:return vm;case 35678:case 36198:case 36298:case 36306:case 35682:return Mm;case 35679:case 36299:case 36307:return Sm;case 35680:case 36300:case 36308:case 36293:return wm;case 36289:case 36303:case 36311:case 36292:return Tm}}function Am(a,e){a.uniform1fv(this.addr,e)}function km(a,e){let n=la(e,this.size,2);a.uniform2fv(this.addr,n)}function Cm(a,e){let n=la(e,this.size,3);a.uniform3fv(this.addr,n)}function Rm(a,e){let n=la(e,this.size,4);a.uniform4fv(this.addr,n)}function Pm(a,e){let n=la(e,this.size,4);a.uniformMatrix2fv(this.addr,!1,n)}function Im(a,e){let n=la(e,this.size,9);a.uniformMatrix3fv(this.addr,!1,n)}function Lm(a,e){let n=la(e,this.size,16);a.uniformMatrix4fv(this.addr,!1,n)}function Dm(a,e){a.uniform1iv(this.addr,e)}function Um(a,e){a.uniform2iv(this.addr,e)}function Nm(a,e){a.uniform3iv(this.addr,e)}function Fm(a,e){a.uniform4iv(this.addr,e)}function Bm(a,e){a.uniform1uiv(this.addr,e)}function Om(a,e){a.uniform2uiv(this.addr,e)}function zm(a,e){a.uniform3uiv(this.addr,e)}function Hm(a,e){a.uniform4uiv(this.addr,e)}function Vm(a,e,n){let i=this.cache,s=e.length,r=mo(n,s);Mt(i,r)||(a.uniform1iv(this.addr,r),St(i,r));for(let o=0;o!==s;++o)n.setTexture2D(e[o]||Qu,r[o])}function Gm(a,e,n){let i=this.cache,s=e.length,r=mo(n,s);Mt(i,r)||(a.uniform1iv(this.addr,r),St(i,r));for(let o=0;o!==s;++o)n.setTexture3D(e[o]||th,r[o])}function Wm(a,e,n){let i=this.cache,s=e.length,r=mo(n,s);Mt(i,r)||(a.uniform1iv(this.addr,r),St(i,r));for(let o=0;o!==s;++o)n.setTextureCube(e[o]||nh,r[o])}function Xm(a,e,n){let i=this.cache,s=e.length,r=mo(n,s);Mt(i,r)||(a.uniform1iv(this.addr,r),St(i,r));for(let o=0;o!==s;++o)n.setTexture2DArray(e[o]||eh,r[o])}function qm(a){switch(a){case 5126:return Am;case 35664:return km;case 35665:return Cm;case 35666:return Rm;case 35674:return Pm;case 35675:return Im;case 35676:return Lm;case 5124:case 35670:return Dm;case 35667:case 35671:return Um;case 35668:case 35672:return Nm;case 35669:case 35673:return Fm;case 5125:return Bm;case 36294:return Om;case 36295:return zm;case 36296:return Hm;case 35678:case 36198:case 36298:case 36306:case 35682:return Vm;case 35679:case 36299:case 36307:return Gm;case 35680:case 36300:case 36308:case 36293:return Wm;case 36289:case 36303:case 36311:case 36292:return Xm}}var Fl=class{constructor(e,n,i){this.id=e,this.addr=i,this.cache=[],this.type=n.type,this.setValue=Em(n.type)}},Bl=class{constructor(e,n,i){this.id=e,this.addr=i,this.cache=[],this.type=n.type,this.size=n.size,this.setValue=qm(n.type)}},Ol=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,n,i){let s=this.seq;for(let r=0,o=s.length;r!==o;++r){let l=s[r];l.setValue(e,n[l.id],i)}}},Nl=/(\w+)(\])?(\[|\.)?/g;function Hu(a,e){a.seq.push(e),a.map[e.id]=e}function jm(a,e,n){let i=a.name,s=i.length;for(Nl.lastIndex=0;;){let r=Nl.exec(i),o=Nl.lastIndex,l=r[1],u=r[2]==="]",c=r[3];if(u&&(l=l|0),c===void 0||c==="["&&o+2===s){Hu(n,c===void 0?new Fl(l,a,e):new Bl(l,a,e));break}else{let f=n.map[l];f===void 0&&(f=new Ol(l),Hu(n,f)),n=f}}}var oa=class{constructor(e,n){this.seq=[],this.map={};let i=e.getProgramParameter(n,e.ACTIVE_UNIFORMS);for(let s=0;s<i;++s){let r=e.getActiveUniform(n,s),o=e.getUniformLocation(n,r.name);jm(r,o,this)}}setValue(e,n,i,s){let r=this.map[n];r!==void 0&&r.setValue(e,i,s)}setOptional(e,n,i){let s=n[i];s!==void 0&&this.setValue(e,i,s)}static upload(e,n,i,s){for(let r=0,o=n.length;r!==o;++r){let l=n[r],u=i[l.id];u.needsUpdate!==!1&&l.setValue(e,u.value,s)}}static seqWithValue(e,n){let i=[];for(let s=0,r=e.length;s!==r;++s){let o=e[s];o.id in n&&i.push(o)}return i}};function Vu(a,e,n){let i=a.createShader(e);return a.shaderSource(i,n),a.compileShader(i),i}var Ym=37297,$m=0;function Km(a,e){let n=a.split(`
`),i=[],s=Math.max(e-6,0),r=Math.min(e+6,n.length);for(let o=s;o<r;o++){let l=o+1;i.push(`${l===e?">":" "} ${l}: ${n[o]}`)}return i.join(`
`)}var Gu=new ze;function Jm(a){Ye._getMatrix(Gu,Ye.workingColorSpace,a);let e=`mat3( ${Gu.elements.map(n=>n.toFixed(4))} )`;switch(Ye.getTransfer(a)){case ka:return[e,"LinearTransferOETF"];case nt:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",a),[e,"LinearTransferOETF"]}}function Wu(a,e,n){let i=a.getShaderParameter(e,a.COMPILE_STATUS),r=(a.getShaderInfoLog(e)||"").trim();if(i&&r==="")return"";let o=/ERROR: 0:(\d+)/.exec(r);if(o){let l=parseInt(o[1]);return n.toUpperCase()+`

`+r+`

`+Km(a.getShaderSource(e),l)}else return r}function Zm(a,e){let n=Jm(e);return[`vec4 ${a}( vec4 value ) {`,`	return ${n[1]}( vec4( value.rgb * ${n[0]}, value.a ) );`,"}"].join(`
`)}function Qm(a,e){let n;switch(e){case ru:n="Linear";break;case ou:n="Reinhard";break;case lu:n="Cineon";break;case Tr:n="ACESFilmic";break;case uu:n="AgX";break;case hu:n="Neutral";break;case cu:n="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),n="Linear"}return"vec3 "+a+"( vec3 color ) { return "+n+"ToneMapping( color ); }"}var ho=new U;function eg(){Ye.getLuminanceCoefficients(ho);let a=ho.x.toFixed(4),e=ho.y.toFixed(4),n=ho.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${a}, ${e}, ${n} );`,"	return dot( weights, rgb );","}"].join(`
`)}function tg(a){return[a.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",a.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(as).join(`
`)}function ng(a){let e=[];for(let n in a){let i=a[n];i!==!1&&e.push("#define "+n+" "+i)}return e.join(`
`)}function ig(a,e){let n={},i=a.getProgramParameter(e,a.ACTIVE_ATTRIBUTES);for(let s=0;s<i;s++){let r=a.getActiveAttrib(e,s),o=r.name,l=1;r.type===a.FLOAT_MAT2&&(l=2),r.type===a.FLOAT_MAT3&&(l=3),r.type===a.FLOAT_MAT4&&(l=4),n[o]={type:r.type,location:a.getAttribLocation(e,o),locationSize:l}}return n}function as(a){return a!==""}function Xu(a,e){let n=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return a.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function qu(a,e){return a.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var ag=/^[ \t]*#include +<([\w\d./]+)>/gm;function zl(a){return a.replace(ag,rg)}var sg=new Map;function rg(a,e){let n=Ge[e];if(n===void 0){let i=sg.get(e);if(i!==void 0)n=Ge[i],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("Can not resolve #include <"+e+">")}return zl(n)}var og=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function ju(a){return a.replace(og,lg)}function lg(a,e,n,i){let s="";for(let r=parseInt(e);r<parseInt(n);r++)s+=i.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Yu(a){let e=`precision ${a.precision} float;
	precision ${a.precision} int;
	precision ${a.precision} sampler2D;
	precision ${a.precision} samplerCube;
	precision ${a.precision} sampler3D;
	precision ${a.precision} sampler2DArray;
	precision ${a.precision} sampler2DShadow;
	precision ${a.precision} samplerCubeShadow;
	precision ${a.precision} sampler2DArrayShadow;
	precision ${a.precision} isampler2D;
	precision ${a.precision} isampler3D;
	precision ${a.precision} isamplerCube;
	precision ${a.precision} isampler2DArray;
	precision ${a.precision} usampler2D;
	precision ${a.precision} usampler3D;
	precision ${a.precision} usamplerCube;
	precision ${a.precision} usampler2DArray;
	`;return a.precision==="highp"?e+=`
#define HIGH_PRECISION`:a.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:a.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function cg(a){let e="SHADOWMAP_TYPE_BASIC";return a.shadowMapType===cl?e="SHADOWMAP_TYPE_PCF":a.shadowMapType===yr?e="SHADOWMAP_TYPE_PCF_SOFT":a.shadowMapType===yn&&(e="SHADOWMAP_TYPE_VSM"),e}function ug(a){let e="ENVMAP_TYPE_CUBE";if(a.envMap)switch(a.envMapMode){case gi:case yi:e="ENVMAP_TYPE_CUBE";break;case Za:e="ENVMAP_TYPE_CUBE_UV";break}return e}function hg(a){let e="ENVMAP_MODE_REFLECTION";if(a.envMap)switch(a.envMapMode){case yi:e="ENVMAP_MODE_REFRACTION";break}return e}function dg(a){let e="ENVMAP_BLENDING_NONE";if(a.envMap)switch(a.combine){case fl:e="ENVMAP_BLENDING_MULTIPLY";break;case au:e="ENVMAP_BLENDING_MIX";break;case su:e="ENVMAP_BLENDING_ADD";break}return e}function fg(a){let e=a.envMapCubeUVHeight;if(e===null)return null;let n=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,n),112)),texelHeight:i,maxMip:n}}function pg(a,e,n,i){let s=a.getContext(),r=n.defines,o=n.vertexShader,l=n.fragmentShader,u=cg(n),c=ug(n),h=hg(n),f=dg(n),p=fg(n),g=tg(n),y=ng(r),v=s.createProgram(),m,d,T=n.glslVersion?"#version "+n.glslVersion+`
`:"";n.isRawShaderMaterial?(m=["#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,y].filter(as).join(`
`),m.length>0&&(m+=`
`),d=["#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,y].filter(as).join(`
`),d.length>0&&(d+=`
`)):(m=[Yu(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,y,n.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",n.batching?"#define USE_BATCHING":"",n.batchingColor?"#define USE_BATCHING_COLOR":"",n.instancing?"#define USE_INSTANCING":"",n.instancingColor?"#define USE_INSTANCING_COLOR":"",n.instancingMorph?"#define USE_INSTANCING_MORPH":"",n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.map?"#define USE_MAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+h:"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.displacementMap?"#define USE_DISPLACEMENTMAP":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.mapUv?"#define MAP_UV "+n.mapUv:"",n.alphaMapUv?"#define ALPHAMAP_UV "+n.alphaMapUv:"",n.lightMapUv?"#define LIGHTMAP_UV "+n.lightMapUv:"",n.aoMapUv?"#define AOMAP_UV "+n.aoMapUv:"",n.emissiveMapUv?"#define EMISSIVEMAP_UV "+n.emissiveMapUv:"",n.bumpMapUv?"#define BUMPMAP_UV "+n.bumpMapUv:"",n.normalMapUv?"#define NORMALMAP_UV "+n.normalMapUv:"",n.displacementMapUv?"#define DISPLACEMENTMAP_UV "+n.displacementMapUv:"",n.metalnessMapUv?"#define METALNESSMAP_UV "+n.metalnessMapUv:"",n.roughnessMapUv?"#define ROUGHNESSMAP_UV "+n.roughnessMapUv:"",n.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+n.anisotropyMapUv:"",n.clearcoatMapUv?"#define CLEARCOATMAP_UV "+n.clearcoatMapUv:"",n.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+n.clearcoatNormalMapUv:"",n.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+n.clearcoatRoughnessMapUv:"",n.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+n.iridescenceMapUv:"",n.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+n.iridescenceThicknessMapUv:"",n.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+n.sheenColorMapUv:"",n.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+n.sheenRoughnessMapUv:"",n.specularMapUv?"#define SPECULARMAP_UV "+n.specularMapUv:"",n.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+n.specularColorMapUv:"",n.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+n.specularIntensityMapUv:"",n.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+n.transmissionMapUv:"",n.thicknessMapUv?"#define THICKNESSMAP_UV "+n.thicknessMapUv:"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexColors?"#define USE_COLOR":"",n.vertexAlphas?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.flatShading?"#define FLAT_SHADED":"",n.skinning?"#define USE_SKINNING":"",n.morphTargets?"#define USE_MORPHTARGETS":"",n.morphNormals&&n.flatShading===!1?"#define USE_MORPHNORMALS":"",n.morphColors?"#define USE_MORPHCOLORS":"",n.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+n.morphTextureStride:"",n.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+n.morphTargetsCount:"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+u:"",n.sizeAttenuation?"#define USE_SIZEATTENUATION":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",n.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(as).join(`
`),d=[Yu(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,y,n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",n.map?"#define USE_MAP":"",n.matcap?"#define USE_MATCAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+c:"",n.envMap?"#define "+h:"",n.envMap?"#define "+f:"",p?"#define CUBEUV_TEXEL_WIDTH "+p.texelWidth:"",p?"#define CUBEUV_TEXEL_HEIGHT "+p.texelHeight:"",p?"#define CUBEUV_MAX_MIP "+p.maxMip+".0":"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoat?"#define USE_CLEARCOAT":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.dispersion?"#define USE_DISPERSION":"",n.iridescence?"#define USE_IRIDESCENCE":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaTest?"#define USE_ALPHATEST":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.sheen?"#define USE_SHEEN":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexColors||n.instancingColor||n.batchingColor?"#define USE_COLOR":"",n.vertexAlphas?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.gradientMap?"#define USE_GRADIENTMAP":"",n.flatShading?"#define FLAT_SHADED":"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+u:"",n.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",n.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",n.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",n.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",n.toneMapping!==Ln?"#define TONE_MAPPING":"",n.toneMapping!==Ln?Ge.tonemapping_pars_fragment:"",n.toneMapping!==Ln?Qm("toneMapping",n.toneMapping):"",n.dithering?"#define DITHERING":"",n.opaque?"#define OPAQUE":"",Ge.colorspace_pars_fragment,Zm("linearToOutputTexel",n.outputColorSpace),eg(),n.useDepthPacking?"#define DEPTH_PACKING "+n.depthPacking:"",`
`].filter(as).join(`
`)),o=zl(o),o=Xu(o,n),o=qu(o,n),l=zl(l),l=Xu(l,n),l=qu(l,n),o=ju(o),l=ju(l),n.isRawShaderMaterial!==!0&&(T=`#version 300 es
`,m=[g,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,d=["#define varying in",n.glslVersion===Tl?"":"layout(location = 0) out highp vec4 pc_fragColor;",n.glslVersion===Tl?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+d);let _=T+m+o,x=T+d+l,A=Vu(s,s.VERTEX_SHADER,_),E=Vu(s,s.FRAGMENT_SHADER,x);s.attachShader(v,A),s.attachShader(v,E),n.index0AttributeName!==void 0?s.bindAttribLocation(v,0,n.index0AttributeName):n.morphTargets===!0&&s.bindAttribLocation(v,0,"position"),s.linkProgram(v);function C(I){if(a.debug.checkShaderErrors){let D=s.getProgramInfoLog(v)||"",z=s.getShaderInfoLog(A)||"",H=s.getShaderInfoLog(E)||"",j=D.trim(),W=z.trim(),ne=H.trim(),X=!0,re=!0;if(s.getProgramParameter(v,s.LINK_STATUS)===!1)if(X=!1,typeof a.debug.onShaderError=="function")a.debug.onShaderError(s,v,A,E);else{let le=Wu(s,A,"vertex"),pe=Wu(s,E,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(v,s.VALIDATE_STATUS)+`

Material Name: `+I.name+`
Material Type: `+I.type+`

Program Info Log: `+j+`
`+le+`
`+pe)}else j!==""?console.warn("THREE.WebGLProgram: Program Info Log:",j):(W===""||ne==="")&&(re=!1);re&&(I.diagnostics={runnable:X,programLog:j,vertexShader:{log:W,prefix:m},fragmentShader:{log:ne,prefix:d}})}s.deleteShader(A),s.deleteShader(E),P=new oa(s,v),M=ig(s,v)}let P;this.getUniforms=function(){return P===void 0&&C(this),P};let M;this.getAttributes=function(){return M===void 0&&C(this),M};let w=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return w===!1&&(w=s.getProgramParameter(v,Ym)),w},this.destroy=function(){i.releaseStatesOfProgram(this),s.deleteProgram(v),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=$m++,this.cacheKey=e,this.usedTimes=1,this.program=v,this.vertexShader=A,this.fragmentShader=E,this}var mg=0,Hl=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let n=e.vertexShader,i=e.fragmentShader,s=this._getShaderStage(n),r=this._getShaderStage(i),o=this._getShaderCacheForMaterial(e);return o.has(s)===!1&&(o.add(s),s.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(e){let n=this.materialCache.get(e);for(let i of n)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let n=this.materialCache,i=n.get(e);return i===void 0&&(i=new Set,n.set(e,i)),i}_getShaderStage(e){let n=this.shaderCache,i=n.get(e);return i===void 0&&(i=new Vl(e),n.set(e,i)),i}},Vl=class{constructor(e){this.id=mg++,this.code=e,this.usedTimes=0}};function gg(a,e,n,i,s,r,o){let l=new $i,u=new Hl,c=new Set,h=[],f=s.logarithmicDepthBuffer,p=s.vertexTextures,g=s.precision,y={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function v(M){return c.add(M),M===0?"uv":`uv${M}`}function m(M,w,I,D,z){let H=D.fog,j=z.geometry,W=M.isMeshStandardMaterial?D.environment:null,ne=(M.isMeshStandardMaterial?n:e).get(M.envMap||W),X=ne&&ne.mapping===Za?ne.image.height:null,re=y[M.type];M.precision!==null&&(g=s.getMaxPrecision(M.precision),g!==M.precision&&console.warn("THREE.WebGLProgram.getParameters:",M.precision,"not supported, using",g,"instead."));let le=j.morphAttributes.position||j.morphAttributes.normal||j.morphAttributes.color,pe=le!==void 0?le.length:0,Le=0;j.morphAttributes.position!==void 0&&(Le=1),j.morphAttributes.normal!==void 0&&(Le=2),j.morphAttributes.color!==void 0&&(Le=3);let et,st,qe,K;if(re){let Qe=_n[re];et=Qe.vertexShader,st=Qe.fragmentShader}else et=M.vertexShader,st=M.fragmentShader,u.update(M),qe=u.getVertexShaderID(M),K=u.getFragmentShaderID(M);let Z=a.getRenderTarget(),xe=a.state.buffers.depth.getReversed(),Ue=z.isInstancedMesh===!0,se=z.isBatchedMesh===!0,Re=!!M.map,ut=!!M.matcap,R=!!ne,Ke=!!M.aoMap,Pe=!!M.lightMap,ke=!!M.bumpMap,ye=!!M.normalMap,ft=!!M.displacementMap,Me=!!M.emissiveMap,Ve=!!M.metalnessMap,wt=!!M.roughnessMap,_t=M.anisotropy>0,k=M.clearcoat>0,b=M.dispersion>0,O=M.iridescence>0,$=M.sheen>0,Q=M.transmission>0,Y=_t&&!!M.anisotropyMap,Ee=k&&!!M.clearcoatMap,oe=k&&!!M.clearcoatNormalMap,Se=k&&!!M.clearcoatRoughnessMap,we=O&&!!M.iridescenceMap,ie=O&&!!M.iridescenceThicknessMap,fe=$&&!!M.sheenColorMap,De=$&&!!M.sheenRoughnessMap,Te=!!M.specularMap,he=!!M.specularColorMap,He=!!M.specularIntensityMap,L=Q&&!!M.transmissionMap,ae=Q&&!!M.thicknessMap,ce=!!M.gradientMap,_e=!!M.alphaMap,ee=M.alphaTest>0,J=!!M.alphaHash,ve=!!M.extensions,Fe=Ln;M.toneMapped&&(Z===null||Z.isXRRenderTarget===!0)&&(Fe=a.toneMapping);let lt={shaderID:re,shaderType:M.type,shaderName:M.name,vertexShader:et,fragmentShader:st,defines:M.defines,customVertexShaderID:qe,customFragmentShaderID:K,isRawShaderMaterial:M.isRawShaderMaterial===!0,glslVersion:M.glslVersion,precision:g,batching:se,batchingColor:se&&z._colorsTexture!==null,instancing:Ue,instancingColor:Ue&&z.instanceColor!==null,instancingMorph:Ue&&z.morphTexture!==null,supportsVertexTextures:p,outputColorSpace:Z===null?a.outputColorSpace:Z.isXRRenderTarget===!0?Z.texture.colorSpace:ui,alphaToCoverage:!!M.alphaToCoverage,map:Re,matcap:ut,envMap:R,envMapMode:R&&ne.mapping,envMapCubeUVHeight:X,aoMap:Ke,lightMap:Pe,bumpMap:ke,normalMap:ye,displacementMap:p&&ft,emissiveMap:Me,normalMapObjectSpace:ye&&M.normalMapType===mu,normalMapTangentSpace:ye&&M.normalMapType===Sl,metalnessMap:Ve,roughnessMap:wt,anisotropy:_t,anisotropyMap:Y,clearcoat:k,clearcoatMap:Ee,clearcoatNormalMap:oe,clearcoatRoughnessMap:Se,dispersion:b,iridescence:O,iridescenceMap:we,iridescenceThicknessMap:ie,sheen:$,sheenColorMap:fe,sheenRoughnessMap:De,specularMap:Te,specularColorMap:he,specularIntensityMap:He,transmission:Q,transmissionMap:L,thicknessMap:ae,gradientMap:ce,opaque:M.transparent===!1&&M.blending===li&&M.alphaToCoverage===!1,alphaMap:_e,alphaTest:ee,alphaHash:J,combine:M.combine,mapUv:Re&&v(M.map.channel),aoMapUv:Ke&&v(M.aoMap.channel),lightMapUv:Pe&&v(M.lightMap.channel),bumpMapUv:ke&&v(M.bumpMap.channel),normalMapUv:ye&&v(M.normalMap.channel),displacementMapUv:ft&&v(M.displacementMap.channel),emissiveMapUv:Me&&v(M.emissiveMap.channel),metalnessMapUv:Ve&&v(M.metalnessMap.channel),roughnessMapUv:wt&&v(M.roughnessMap.channel),anisotropyMapUv:Y&&v(M.anisotropyMap.channel),clearcoatMapUv:Ee&&v(M.clearcoatMap.channel),clearcoatNormalMapUv:oe&&v(M.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Se&&v(M.clearcoatRoughnessMap.channel),iridescenceMapUv:we&&v(M.iridescenceMap.channel),iridescenceThicknessMapUv:ie&&v(M.iridescenceThicknessMap.channel),sheenColorMapUv:fe&&v(M.sheenColorMap.channel),sheenRoughnessMapUv:De&&v(M.sheenRoughnessMap.channel),specularMapUv:Te&&v(M.specularMap.channel),specularColorMapUv:he&&v(M.specularColorMap.channel),specularIntensityMapUv:He&&v(M.specularIntensityMap.channel),transmissionMapUv:L&&v(M.transmissionMap.channel),thicknessMapUv:ae&&v(M.thicknessMap.channel),alphaMapUv:_e&&v(M.alphaMap.channel),vertexTangents:!!j.attributes.tangent&&(ye||_t),vertexColors:M.vertexColors,vertexAlphas:M.vertexColors===!0&&!!j.attributes.color&&j.attributes.color.itemSize===4,pointsUvs:z.isPoints===!0&&!!j.attributes.uv&&(Re||_e),fog:!!H,useFog:M.fog===!0,fogExp2:!!H&&H.isFogExp2,flatShading:M.flatShading===!0&&M.wireframe===!1,sizeAttenuation:M.sizeAttenuation===!0,logarithmicDepthBuffer:f,reversedDepthBuffer:xe,skinning:z.isSkinnedMesh===!0,morphTargets:j.morphAttributes.position!==void 0,morphNormals:j.morphAttributes.normal!==void 0,morphColors:j.morphAttributes.color!==void 0,morphTargetsCount:pe,morphTextureStride:Le,numDirLights:w.directional.length,numPointLights:w.point.length,numSpotLights:w.spot.length,numSpotLightMaps:w.spotLightMap.length,numRectAreaLights:w.rectArea.length,numHemiLights:w.hemi.length,numDirLightShadows:w.directionalShadowMap.length,numPointLightShadows:w.pointShadowMap.length,numSpotLightShadows:w.spotShadowMap.length,numSpotLightShadowsWithMaps:w.numSpotLightShadowsWithMaps,numLightProbes:w.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:M.dithering,shadowMapEnabled:a.shadowMap.enabled&&I.length>0,shadowMapType:a.shadowMap.type,toneMapping:Fe,decodeVideoTexture:Re&&M.map.isVideoTexture===!0&&Ye.getTransfer(M.map.colorSpace)===nt,decodeVideoTextureEmissive:Me&&M.emissiveMap.isVideoTexture===!0&&Ye.getTransfer(M.emissiveMap.colorSpace)===nt,premultipliedAlpha:M.premultipliedAlpha,doubleSided:M.side===Ht,flipSided:M.side===Bt,useDepthPacking:M.depthPacking>=0,depthPacking:M.depthPacking||0,index0AttributeName:M.index0AttributeName,extensionClipCullDistance:ve&&M.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(ve&&M.extensions.multiDraw===!0||se)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:M.customProgramCacheKey()};return lt.vertexUv1s=c.has(1),lt.vertexUv2s=c.has(2),lt.vertexUv3s=c.has(3),c.clear(),lt}function d(M){let w=[];if(M.shaderID?w.push(M.shaderID):(w.push(M.customVertexShaderID),w.push(M.customFragmentShaderID)),M.defines!==void 0)for(let I in M.defines)w.push(I),w.push(M.defines[I]);return M.isRawShaderMaterial===!1&&(T(w,M),_(w,M),w.push(a.outputColorSpace)),w.push(M.customProgramCacheKey),w.join()}function T(M,w){M.push(w.precision),M.push(w.outputColorSpace),M.push(w.envMapMode),M.push(w.envMapCubeUVHeight),M.push(w.mapUv),M.push(w.alphaMapUv),M.push(w.lightMapUv),M.push(w.aoMapUv),M.push(w.bumpMapUv),M.push(w.normalMapUv),M.push(w.displacementMapUv),M.push(w.emissiveMapUv),M.push(w.metalnessMapUv),M.push(w.roughnessMapUv),M.push(w.anisotropyMapUv),M.push(w.clearcoatMapUv),M.push(w.clearcoatNormalMapUv),M.push(w.clearcoatRoughnessMapUv),M.push(w.iridescenceMapUv),M.push(w.iridescenceThicknessMapUv),M.push(w.sheenColorMapUv),M.push(w.sheenRoughnessMapUv),M.push(w.specularMapUv),M.push(w.specularColorMapUv),M.push(w.specularIntensityMapUv),M.push(w.transmissionMapUv),M.push(w.thicknessMapUv),M.push(w.combine),M.push(w.fogExp2),M.push(w.sizeAttenuation),M.push(w.morphTargetsCount),M.push(w.morphAttributeCount),M.push(w.numDirLights),M.push(w.numPointLights),M.push(w.numSpotLights),M.push(w.numSpotLightMaps),M.push(w.numHemiLights),M.push(w.numRectAreaLights),M.push(w.numDirLightShadows),M.push(w.numPointLightShadows),M.push(w.numSpotLightShadows),M.push(w.numSpotLightShadowsWithMaps),M.push(w.numLightProbes),M.push(w.shadowMapType),M.push(w.toneMapping),M.push(w.numClippingPlanes),M.push(w.numClipIntersection),M.push(w.depthPacking)}function _(M,w){l.disableAll(),w.supportsVertexTextures&&l.enable(0),w.instancing&&l.enable(1),w.instancingColor&&l.enable(2),w.instancingMorph&&l.enable(3),w.matcap&&l.enable(4),w.envMap&&l.enable(5),w.normalMapObjectSpace&&l.enable(6),w.normalMapTangentSpace&&l.enable(7),w.clearcoat&&l.enable(8),w.iridescence&&l.enable(9),w.alphaTest&&l.enable(10),w.vertexColors&&l.enable(11),w.vertexAlphas&&l.enable(12),w.vertexUv1s&&l.enable(13),w.vertexUv2s&&l.enable(14),w.vertexUv3s&&l.enable(15),w.vertexTangents&&l.enable(16),w.anisotropy&&l.enable(17),w.alphaHash&&l.enable(18),w.batching&&l.enable(19),w.dispersion&&l.enable(20),w.batchingColor&&l.enable(21),w.gradientMap&&l.enable(22),M.push(l.mask),l.disableAll(),w.fog&&l.enable(0),w.useFog&&l.enable(1),w.flatShading&&l.enable(2),w.logarithmicDepthBuffer&&l.enable(3),w.reversedDepthBuffer&&l.enable(4),w.skinning&&l.enable(5),w.morphTargets&&l.enable(6),w.morphNormals&&l.enable(7),w.morphColors&&l.enable(8),w.premultipliedAlpha&&l.enable(9),w.shadowMapEnabled&&l.enable(10),w.doubleSided&&l.enable(11),w.flipSided&&l.enable(12),w.useDepthPacking&&l.enable(13),w.dithering&&l.enable(14),w.transmission&&l.enable(15),w.sheen&&l.enable(16),w.opaque&&l.enable(17),w.pointsUvs&&l.enable(18),w.decodeVideoTexture&&l.enable(19),w.decodeVideoTextureEmissive&&l.enable(20),w.alphaToCoverage&&l.enable(21),M.push(l.mask)}function x(M){let w=y[M.type],I;if(w){let D=_n[w];I=Eu.clone(D.uniforms)}else I=M.uniforms;return I}function A(M,w){let I;for(let D=0,z=h.length;D<z;D++){let H=h[D];if(H.cacheKey===w){I=H,++I.usedTimes;break}}return I===void 0&&(I=new pg(a,w,M,r),h.push(I)),I}function E(M){if(--M.usedTimes===0){let w=h.indexOf(M);h[w]=h[h.length-1],h.pop(),M.destroy()}}function C(M){u.remove(M)}function P(){u.dispose()}return{getParameters:m,getProgramCacheKey:d,getUniforms:x,acquireProgram:A,releaseProgram:E,releaseShaderCache:C,programs:h,dispose:P}}function yg(){let a=new WeakMap;function e(o){return a.has(o)}function n(o){let l=a.get(o);return l===void 0&&(l={},a.set(o,l)),l}function i(o){a.delete(o)}function s(o,l,u){a.get(o)[l]=u}function r(){a=new WeakMap}return{has:e,get:n,remove:i,update:s,dispose:r}}function xg(a,e){return a.groupOrder!==e.groupOrder?a.groupOrder-e.groupOrder:a.renderOrder!==e.renderOrder?a.renderOrder-e.renderOrder:a.material.id!==e.material.id?a.material.id-e.material.id:a.z!==e.z?a.z-e.z:a.id-e.id}function $u(a,e){return a.groupOrder!==e.groupOrder?a.groupOrder-e.groupOrder:a.renderOrder!==e.renderOrder?a.renderOrder-e.renderOrder:a.z!==e.z?e.z-a.z:a.id-e.id}function Ku(){let a=[],e=0,n=[],i=[],s=[];function r(){e=0,n.length=0,i.length=0,s.length=0}function o(f,p,g,y,v,m){let d=a[e];return d===void 0?(d={id:f.id,object:f,geometry:p,material:g,groupOrder:y,renderOrder:f.renderOrder,z:v,group:m},a[e]=d):(d.id=f.id,d.object=f,d.geometry=p,d.material=g,d.groupOrder=y,d.renderOrder=f.renderOrder,d.z=v,d.group=m),e++,d}function l(f,p,g,y,v,m){let d=o(f,p,g,y,v,m);g.transmission>0?i.push(d):g.transparent===!0?s.push(d):n.push(d)}function u(f,p,g,y,v,m){let d=o(f,p,g,y,v,m);g.transmission>0?i.unshift(d):g.transparent===!0?s.unshift(d):n.unshift(d)}function c(f,p){n.length>1&&n.sort(f||xg),i.length>1&&i.sort(p||$u),s.length>1&&s.sort(p||$u)}function h(){for(let f=e,p=a.length;f<p;f++){let g=a[f];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:n,transmissive:i,transparent:s,init:r,push:l,unshift:u,finish:h,sort:c}}function _g(){let a=new WeakMap;function e(i,s){let r=a.get(i),o;return r===void 0?(o=new Ku,a.set(i,[o])):s>=r.length?(o=new Ku,r.push(o)):o=r[s],o}function n(){a=new WeakMap}return{get:e,dispose:n}}function bg(){let a={};return{get:function(e){if(a[e.id]!==void 0)return a[e.id];let n;switch(e.type){case"DirectionalLight":n={direction:new U,color:new Oe};break;case"SpotLight":n={position:new U,direction:new U,color:new Oe,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":n={position:new U,color:new Oe,distance:0,decay:0};break;case"HemisphereLight":n={direction:new U,skyColor:new Oe,groundColor:new Oe};break;case"RectAreaLight":n={color:new Oe,position:new U,halfWidth:new U,halfHeight:new U};break}return a[e.id]=n,n}}}function vg(){let a={};return{get:function(e){if(a[e.id]!==void 0)return a[e.id];let n;switch(e.type){case"DirectionalLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Be};break;case"SpotLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Be};break;case"PointLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Be,shadowCameraNear:1,shadowCameraFar:1e3};break}return a[e.id]=n,n}}}var Mg=0;function Sg(a,e){return(e.castShadow?2:0)-(a.castShadow?2:0)+(e.map?1:0)-(a.map?1:0)}function wg(a){let e=new bg,n=vg(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new U);let s=new U,r=new ot,o=new ot;function l(c){let h=0,f=0,p=0;for(let M=0;M<9;M++)i.probe[M].set(0,0,0);let g=0,y=0,v=0,m=0,d=0,T=0,_=0,x=0,A=0,E=0,C=0;c.sort(Sg);for(let M=0,w=c.length;M<w;M++){let I=c[M],D=I.color,z=I.intensity,H=I.distance,j=I.shadow&&I.shadow.map?I.shadow.map.texture:null;if(I.isAmbientLight)h+=D.r*z,f+=D.g*z,p+=D.b*z;else if(I.isLightProbe){for(let W=0;W<9;W++)i.probe[W].addScaledVector(I.sh.coefficients[W],z);C++}else if(I.isDirectionalLight){let W=e.get(I);if(W.color.copy(I.color).multiplyScalar(I.intensity),I.castShadow){let ne=I.shadow,X=n.get(I);X.shadowIntensity=ne.intensity,X.shadowBias=ne.bias,X.shadowNormalBias=ne.normalBias,X.shadowRadius=ne.radius,X.shadowMapSize=ne.mapSize,i.directionalShadow[g]=X,i.directionalShadowMap[g]=j,i.directionalShadowMatrix[g]=I.shadow.matrix,T++}i.directional[g]=W,g++}else if(I.isSpotLight){let W=e.get(I);W.position.setFromMatrixPosition(I.matrixWorld),W.color.copy(D).multiplyScalar(z),W.distance=H,W.coneCos=Math.cos(I.angle),W.penumbraCos=Math.cos(I.angle*(1-I.penumbra)),W.decay=I.decay,i.spot[v]=W;let ne=I.shadow;if(I.map&&(i.spotLightMap[A]=I.map,A++,ne.updateMatrices(I),I.castShadow&&E++),i.spotLightMatrix[v]=ne.matrix,I.castShadow){let X=n.get(I);X.shadowIntensity=ne.intensity,X.shadowBias=ne.bias,X.shadowNormalBias=ne.normalBias,X.shadowRadius=ne.radius,X.shadowMapSize=ne.mapSize,i.spotShadow[v]=X,i.spotShadowMap[v]=j,x++}v++}else if(I.isRectAreaLight){let W=e.get(I);W.color.copy(D).multiplyScalar(z),W.halfWidth.set(I.width*.5,0,0),W.halfHeight.set(0,I.height*.5,0),i.rectArea[m]=W,m++}else if(I.isPointLight){let W=e.get(I);if(W.color.copy(I.color).multiplyScalar(I.intensity),W.distance=I.distance,W.decay=I.decay,I.castShadow){let ne=I.shadow,X=n.get(I);X.shadowIntensity=ne.intensity,X.shadowBias=ne.bias,X.shadowNormalBias=ne.normalBias,X.shadowRadius=ne.radius,X.shadowMapSize=ne.mapSize,X.shadowCameraNear=ne.camera.near,X.shadowCameraFar=ne.camera.far,i.pointShadow[y]=X,i.pointShadowMap[y]=j,i.pointShadowMatrix[y]=I.shadow.matrix,_++}i.point[y]=W,y++}else if(I.isHemisphereLight){let W=e.get(I);W.skyColor.copy(I.color).multiplyScalar(z),W.groundColor.copy(I.groundColor).multiplyScalar(z),i.hemi[d]=W,d++}}m>0&&(a.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=ue.LTC_FLOAT_1,i.rectAreaLTC2=ue.LTC_FLOAT_2):(i.rectAreaLTC1=ue.LTC_HALF_1,i.rectAreaLTC2=ue.LTC_HALF_2)),i.ambient[0]=h,i.ambient[1]=f,i.ambient[2]=p;let P=i.hash;(P.directionalLength!==g||P.pointLength!==y||P.spotLength!==v||P.rectAreaLength!==m||P.hemiLength!==d||P.numDirectionalShadows!==T||P.numPointShadows!==_||P.numSpotShadows!==x||P.numSpotMaps!==A||P.numLightProbes!==C)&&(i.directional.length=g,i.spot.length=v,i.rectArea.length=m,i.point.length=y,i.hemi.length=d,i.directionalShadow.length=T,i.directionalShadowMap.length=T,i.pointShadow.length=_,i.pointShadowMap.length=_,i.spotShadow.length=x,i.spotShadowMap.length=x,i.directionalShadowMatrix.length=T,i.pointShadowMatrix.length=_,i.spotLightMatrix.length=x+A-E,i.spotLightMap.length=A,i.numSpotLightShadowsWithMaps=E,i.numLightProbes=C,P.directionalLength=g,P.pointLength=y,P.spotLength=v,P.rectAreaLength=m,P.hemiLength=d,P.numDirectionalShadows=T,P.numPointShadows=_,P.numSpotShadows=x,P.numSpotMaps=A,P.numLightProbes=C,i.version=Mg++)}function u(c,h){let f=0,p=0,g=0,y=0,v=0,m=h.matrixWorldInverse;for(let d=0,T=c.length;d<T;d++){let _=c[d];if(_.isDirectionalLight){let x=i.directional[f];x.direction.setFromMatrixPosition(_.matrixWorld),s.setFromMatrixPosition(_.target.matrixWorld),x.direction.sub(s),x.direction.transformDirection(m),f++}else if(_.isSpotLight){let x=i.spot[g];x.position.setFromMatrixPosition(_.matrixWorld),x.position.applyMatrix4(m),x.direction.setFromMatrixPosition(_.matrixWorld),s.setFromMatrixPosition(_.target.matrixWorld),x.direction.sub(s),x.direction.transformDirection(m),g++}else if(_.isRectAreaLight){let x=i.rectArea[y];x.position.setFromMatrixPosition(_.matrixWorld),x.position.applyMatrix4(m),o.identity(),r.copy(_.matrixWorld),r.premultiply(m),o.extractRotation(r),x.halfWidth.set(_.width*.5,0,0),x.halfHeight.set(0,_.height*.5,0),x.halfWidth.applyMatrix4(o),x.halfHeight.applyMatrix4(o),y++}else if(_.isPointLight){let x=i.point[p];x.position.setFromMatrixPosition(_.matrixWorld),x.position.applyMatrix4(m),p++}else if(_.isHemisphereLight){let x=i.hemi[v];x.direction.setFromMatrixPosition(_.matrixWorld),x.direction.transformDirection(m),v++}}}return{setup:l,setupView:u,state:i}}function Ju(a){let e=new wg(a),n=[],i=[];function s(h){c.camera=h,n.length=0,i.length=0}function r(h){n.push(h)}function o(h){i.push(h)}function l(){e.setup(n)}function u(h){e.setupView(n,h)}let c={lightsArray:n,shadowsArray:i,camera:null,lights:e,transmissionRenderTarget:{}};return{init:s,state:c,setupLights:l,setupLightsView:u,pushLight:r,pushShadow:o}}function Tg(a){let e=new WeakMap;function n(s,r=0){let o=e.get(s),l;return o===void 0?(l=new Ju(a),e.set(s,[l])):r>=o.length?(l=new Ju(a),o.push(l)):l=o[r],l}function i(){e=new WeakMap}return{get:n,dispose:i}}var Eg=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Ag=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function kg(a,e,n){let i=new qn,s=new Be,r=new Be,o=new gt,l=new sr({depthPacking:pu}),u=new rr,c={},h=n.maxTextureSize,f={[Cn]:Bt,[Bt]:Cn,[Ht]:Ht},p=new cn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Be},radius:{value:4}},vertexShader:Eg,fragmentShader:Ag}),g=p.clone();g.defines.HORIZONTAL_PASS=1;let y=new Ft;y.setAttribute("position",new It(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let v=new yt(y,p),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=cl;let d=this.type;this.render=function(E,C,P){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||E.length===0)return;let M=a.getRenderTarget(),w=a.getActiveCubeFace(),I=a.getActiveMipmapLevel(),D=a.state;D.setBlending(In),D.buffers.depth.getReversed()===!0?D.buffers.color.setClear(0,0,0,0):D.buffers.color.setClear(1,1,1,1),D.buffers.depth.setTest(!0),D.setScissorTest(!1);let z=d!==yn&&this.type===yn,H=d===yn&&this.type!==yn;for(let j=0,W=E.length;j<W;j++){let ne=E[j],X=ne.shadow;if(X===void 0){console.warn("THREE.WebGLShadowMap:",ne,"has no shadow.");continue}if(X.autoUpdate===!1&&X.needsUpdate===!1)continue;s.copy(X.mapSize);let re=X.getFrameExtents();if(s.multiply(re),r.copy(X.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/re.x),s.x=r.x*re.x,X.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/re.y),s.y=r.y*re.y,X.mapSize.y=r.y)),X.map===null||z===!0||H===!0){let pe=this.type!==yn?{minFilter:Qt,magFilter:Qt}:{};X.map!==null&&X.map.dispose(),X.map=new mn(s.x,s.y,pe),X.map.texture.name=ne.name+".shadowMap",X.camera.updateProjectionMatrix()}a.setRenderTarget(X.map),a.clear();let le=X.getViewportCount();for(let pe=0;pe<le;pe++){let Le=X.getViewport(pe);o.set(r.x*Le.x,r.y*Le.y,r.x*Le.z,r.y*Le.w),D.viewport(o),X.updateMatrices(ne,pe),i=X.getFrustum(),x(C,P,X.camera,ne,this.type)}X.isPointLightShadow!==!0&&this.type===yn&&T(X,P),X.needsUpdate=!1}d=this.type,m.needsUpdate=!1,a.setRenderTarget(M,w,I)};function T(E,C){let P=e.update(v);p.defines.VSM_SAMPLES!==E.blurSamples&&(p.defines.VSM_SAMPLES=E.blurSamples,g.defines.VSM_SAMPLES=E.blurSamples,p.needsUpdate=!0,g.needsUpdate=!0),E.mapPass===null&&(E.mapPass=new mn(s.x,s.y)),p.uniforms.shadow_pass.value=E.map.texture,p.uniforms.resolution.value=E.mapSize,p.uniforms.radius.value=E.radius,a.setRenderTarget(E.mapPass),a.clear(),a.renderBufferDirect(C,null,P,p,v,null),g.uniforms.shadow_pass.value=E.mapPass.texture,g.uniforms.resolution.value=E.mapSize,g.uniforms.radius.value=E.radius,a.setRenderTarget(E.map),a.clear(),a.renderBufferDirect(C,null,P,g,v,null)}function _(E,C,P,M){let w=null,I=P.isPointLight===!0?E.customDistanceMaterial:E.customDepthMaterial;if(I!==void 0)w=I;else if(w=P.isPointLight===!0?u:l,a.localClippingEnabled&&C.clipShadows===!0&&Array.isArray(C.clippingPlanes)&&C.clippingPlanes.length!==0||C.displacementMap&&C.displacementScale!==0||C.alphaMap&&C.alphaTest>0||C.map&&C.alphaTest>0||C.alphaToCoverage===!0){let D=w.uuid,z=C.uuid,H=c[D];H===void 0&&(H={},c[D]=H);let j=H[z];j===void 0&&(j=w.clone(),H[z]=j,C.addEventListener("dispose",A)),w=j}if(w.visible=C.visible,w.wireframe=C.wireframe,M===yn?w.side=C.shadowSide!==null?C.shadowSide:C.side:w.side=C.shadowSide!==null?C.shadowSide:f[C.side],w.alphaMap=C.alphaMap,w.alphaTest=C.alphaToCoverage===!0?.5:C.alphaTest,w.map=C.map,w.clipShadows=C.clipShadows,w.clippingPlanes=C.clippingPlanes,w.clipIntersection=C.clipIntersection,w.displacementMap=C.displacementMap,w.displacementScale=C.displacementScale,w.displacementBias=C.displacementBias,w.wireframeLinewidth=C.wireframeLinewidth,w.linewidth=C.linewidth,P.isPointLight===!0&&w.isMeshDistanceMaterial===!0){let D=a.properties.get(w);D.light=P}return w}function x(E,C,P,M,w){if(E.visible===!1)return;if(E.layers.test(C.layers)&&(E.isMesh||E.isLine||E.isPoints)&&(E.castShadow||E.receiveShadow&&w===yn)&&(!E.frustumCulled||i.intersectsObject(E))){E.modelViewMatrix.multiplyMatrices(P.matrixWorldInverse,E.matrixWorld);let z=e.update(E),H=E.material;if(Array.isArray(H)){let j=z.groups;for(let W=0,ne=j.length;W<ne;W++){let X=j[W],re=H[X.materialIndex];if(re&&re.visible){let le=_(E,re,M,w);E.onBeforeShadow(a,E,C,P,z,le,X),a.renderBufferDirect(P,null,z,le,E,X),E.onAfterShadow(a,E,C,P,z,le,X)}}}else if(H.visible){let j=_(E,H,M,w);E.onBeforeShadow(a,E,C,P,z,j,null),a.renderBufferDirect(P,null,z,j,E,null),E.onAfterShadow(a,E,C,P,z,j,null)}}let D=E.children;for(let z=0,H=D.length;z<H;z++)x(D[z],C,P,M,w)}function A(E){E.target.removeEventListener("dispose",A);for(let P in c){let M=c[P],w=E.target.uuid;w in M&&(M[w].dispose(),delete M[w])}}}var Cg={[xr]:_r,[br]:Sr,[vr]:wr,[ci]:Mr,[_r]:xr,[Sr]:br,[wr]:vr,[Mr]:ci};function Rg(a,e){function n(){let L=!1,ae=new gt,ce=null,_e=new gt(0,0,0,0);return{setMask:function(ee){ce!==ee&&!L&&(a.colorMask(ee,ee,ee,ee),ce=ee)},setLocked:function(ee){L=ee},setClear:function(ee,J,ve,Fe,lt){lt===!0&&(ee*=Fe,J*=Fe,ve*=Fe),ae.set(ee,J,ve,Fe),_e.equals(ae)===!1&&(a.clearColor(ee,J,ve,Fe),_e.copy(ae))},reset:function(){L=!1,ce=null,_e.set(-1,0,0,0)}}}function i(){let L=!1,ae=!1,ce=null,_e=null,ee=null;return{setReversed:function(J){if(ae!==J){let ve=e.get("EXT_clip_control");J?ve.clipControlEXT(ve.LOWER_LEFT_EXT,ve.ZERO_TO_ONE_EXT):ve.clipControlEXT(ve.LOWER_LEFT_EXT,ve.NEGATIVE_ONE_TO_ONE_EXT),ae=J;let Fe=ee;ee=null,this.setClear(Fe)}},getReversed:function(){return ae},setTest:function(J){J?Z(a.DEPTH_TEST):xe(a.DEPTH_TEST)},setMask:function(J){ce!==J&&!L&&(a.depthMask(J),ce=J)},setFunc:function(J){if(ae&&(J=Cg[J]),_e!==J){switch(J){case xr:a.depthFunc(a.NEVER);break;case _r:a.depthFunc(a.ALWAYS);break;case br:a.depthFunc(a.LESS);break;case ci:a.depthFunc(a.LEQUAL);break;case vr:a.depthFunc(a.EQUAL);break;case Mr:a.depthFunc(a.GEQUAL);break;case Sr:a.depthFunc(a.GREATER);break;case wr:a.depthFunc(a.NOTEQUAL);break;default:a.depthFunc(a.LEQUAL)}_e=J}},setLocked:function(J){L=J},setClear:function(J){ee!==J&&(ae&&(J=1-J),a.clearDepth(J),ee=J)},reset:function(){L=!1,ce=null,_e=null,ee=null,ae=!1}}}function s(){let L=!1,ae=null,ce=null,_e=null,ee=null,J=null,ve=null,Fe=null,lt=null;return{setTest:function(Qe){L||(Qe?Z(a.STENCIL_TEST):xe(a.STENCIL_TEST))},setMask:function(Qe){ae!==Qe&&!L&&(a.stencilMask(Qe),ae=Qe)},setFunc:function(Qe,Mn,hn){(ce!==Qe||_e!==Mn||ee!==hn)&&(a.stencilFunc(Qe,Mn,hn),ce=Qe,_e=Mn,ee=hn)},setOp:function(Qe,Mn,hn){(J!==Qe||ve!==Mn||Fe!==hn)&&(a.stencilOp(Qe,Mn,hn),J=Qe,ve=Mn,Fe=hn)},setLocked:function(Qe){L=Qe},setClear:function(Qe){lt!==Qe&&(a.clearStencil(Qe),lt=Qe)},reset:function(){L=!1,ae=null,ce=null,_e=null,ee=null,J=null,ve=null,Fe=null,lt=null}}}let r=new n,o=new i,l=new s,u=new WeakMap,c=new WeakMap,h={},f={},p=new WeakMap,g=[],y=null,v=!1,m=null,d=null,T=null,_=null,x=null,A=null,E=null,C=new Oe(0,0,0),P=0,M=!1,w=null,I=null,D=null,z=null,H=null,j=a.getParameter(a.MAX_COMBINED_TEXTURE_IMAGE_UNITS),W=!1,ne=0,X=a.getParameter(a.VERSION);X.indexOf("WebGL")!==-1?(ne=parseFloat(/^WebGL (\d)/.exec(X)[1]),W=ne>=1):X.indexOf("OpenGL ES")!==-1&&(ne=parseFloat(/^OpenGL ES (\d)/.exec(X)[1]),W=ne>=2);let re=null,le={},pe=a.getParameter(a.SCISSOR_BOX),Le=a.getParameter(a.VIEWPORT),et=new gt().fromArray(pe),st=new gt().fromArray(Le);function qe(L,ae,ce,_e){let ee=new Uint8Array(4),J=a.createTexture();a.bindTexture(L,J),a.texParameteri(L,a.TEXTURE_MIN_FILTER,a.NEAREST),a.texParameteri(L,a.TEXTURE_MAG_FILTER,a.NEAREST);for(let ve=0;ve<ce;ve++)L===a.TEXTURE_3D||L===a.TEXTURE_2D_ARRAY?a.texImage3D(ae,0,a.RGBA,1,1,_e,0,a.RGBA,a.UNSIGNED_BYTE,ee):a.texImage2D(ae+ve,0,a.RGBA,1,1,0,a.RGBA,a.UNSIGNED_BYTE,ee);return J}let K={};K[a.TEXTURE_2D]=qe(a.TEXTURE_2D,a.TEXTURE_2D,1),K[a.TEXTURE_CUBE_MAP]=qe(a.TEXTURE_CUBE_MAP,a.TEXTURE_CUBE_MAP_POSITIVE_X,6),K[a.TEXTURE_2D_ARRAY]=qe(a.TEXTURE_2D_ARRAY,a.TEXTURE_2D_ARRAY,1,1),K[a.TEXTURE_3D]=qe(a.TEXTURE_3D,a.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),l.setClear(0),Z(a.DEPTH_TEST),o.setFunc(ci),ke(!1),ye(ll),Z(a.CULL_FACE),Ke(In);function Z(L){h[L]!==!0&&(a.enable(L),h[L]=!0)}function xe(L){h[L]!==!1&&(a.disable(L),h[L]=!1)}function Ue(L,ae){return f[L]!==ae?(a.bindFramebuffer(L,ae),f[L]=ae,L===a.DRAW_FRAMEBUFFER&&(f[a.FRAMEBUFFER]=ae),L===a.FRAMEBUFFER&&(f[a.DRAW_FRAMEBUFFER]=ae),!0):!1}function se(L,ae){let ce=g,_e=!1;if(L){ce=p.get(ae),ce===void 0&&(ce=[],p.set(ae,ce));let ee=L.textures;if(ce.length!==ee.length||ce[0]!==a.COLOR_ATTACHMENT0){for(let J=0,ve=ee.length;J<ve;J++)ce[J]=a.COLOR_ATTACHMENT0+J;ce.length=ee.length,_e=!0}}else ce[0]!==a.BACK&&(ce[0]=a.BACK,_e=!0);_e&&a.drawBuffers(ce)}function Re(L){return y!==L?(a.useProgram(L),y=L,!0):!1}let ut={[Gn]:a.FUNC_ADD,[Hc]:a.FUNC_SUBTRACT,[Vc]:a.FUNC_REVERSE_SUBTRACT};ut[Gc]=a.MIN,ut[Wc]=a.MAX;let R={[Xc]:a.ZERO,[qc]:a.ONE,[jc]:a.SRC_COLOR,[Vs]:a.SRC_ALPHA,[Qc]:a.SRC_ALPHA_SATURATE,[Jc]:a.DST_COLOR,[$c]:a.DST_ALPHA,[Yc]:a.ONE_MINUS_SRC_COLOR,[Gs]:a.ONE_MINUS_SRC_ALPHA,[Zc]:a.ONE_MINUS_DST_COLOR,[Kc]:a.ONE_MINUS_DST_ALPHA,[eu]:a.CONSTANT_COLOR,[tu]:a.ONE_MINUS_CONSTANT_COLOR,[nu]:a.CONSTANT_ALPHA,[iu]:a.ONE_MINUS_CONSTANT_ALPHA};function Ke(L,ae,ce,_e,ee,J,ve,Fe,lt,Qe){if(L===In){v===!0&&(xe(a.BLEND),v=!1);return}if(v===!1&&(Z(a.BLEND),v=!0),L!==zc){if(L!==m||Qe!==M){if((d!==Gn||x!==Gn)&&(a.blendEquation(a.FUNC_ADD),d=Gn,x=Gn),Qe)switch(L){case li:a.blendFuncSeparate(a.ONE,a.ONE_MINUS_SRC_ALPHA,a.ONE,a.ONE_MINUS_SRC_ALPHA);break;case ul:a.blendFunc(a.ONE,a.ONE);break;case hl:a.blendFuncSeparate(a.ZERO,a.ONE_MINUS_SRC_COLOR,a.ZERO,a.ONE);break;case dl:a.blendFuncSeparate(a.DST_COLOR,a.ONE_MINUS_SRC_ALPHA,a.ZERO,a.ONE);break;default:console.error("THREE.WebGLState: Invalid blending: ",L);break}else switch(L){case li:a.blendFuncSeparate(a.SRC_ALPHA,a.ONE_MINUS_SRC_ALPHA,a.ONE,a.ONE_MINUS_SRC_ALPHA);break;case ul:a.blendFuncSeparate(a.SRC_ALPHA,a.ONE,a.ONE,a.ONE);break;case hl:console.error("THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case dl:console.error("THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:console.error("THREE.WebGLState: Invalid blending: ",L);break}T=null,_=null,A=null,E=null,C.set(0,0,0),P=0,m=L,M=Qe}return}ee=ee||ae,J=J||ce,ve=ve||_e,(ae!==d||ee!==x)&&(a.blendEquationSeparate(ut[ae],ut[ee]),d=ae,x=ee),(ce!==T||_e!==_||J!==A||ve!==E)&&(a.blendFuncSeparate(R[ce],R[_e],R[J],R[ve]),T=ce,_=_e,A=J,E=ve),(Fe.equals(C)===!1||lt!==P)&&(a.blendColor(Fe.r,Fe.g,Fe.b,lt),C.copy(Fe),P=lt),m=L,M=!1}function Pe(L,ae){L.side===Ht?xe(a.CULL_FACE):Z(a.CULL_FACE);let ce=L.side===Bt;ae&&(ce=!ce),ke(ce),L.blending===li&&L.transparent===!1?Ke(In):Ke(L.blending,L.blendEquation,L.blendSrc,L.blendDst,L.blendEquationAlpha,L.blendSrcAlpha,L.blendDstAlpha,L.blendColor,L.blendAlpha,L.premultipliedAlpha),o.setFunc(L.depthFunc),o.setTest(L.depthTest),o.setMask(L.depthWrite),r.setMask(L.colorWrite);let _e=L.stencilWrite;l.setTest(_e),_e&&(l.setMask(L.stencilWriteMask),l.setFunc(L.stencilFunc,L.stencilRef,L.stencilFuncMask),l.setOp(L.stencilFail,L.stencilZFail,L.stencilZPass)),Me(L.polygonOffset,L.polygonOffsetFactor,L.polygonOffsetUnits),L.alphaToCoverage===!0?Z(a.SAMPLE_ALPHA_TO_COVERAGE):xe(a.SAMPLE_ALPHA_TO_COVERAGE)}function ke(L){w!==L&&(L?a.frontFace(a.CW):a.frontFace(a.CCW),w=L)}function ye(L){L!==Bc?(Z(a.CULL_FACE),L!==I&&(L===ll?a.cullFace(a.BACK):L===Oc?a.cullFace(a.FRONT):a.cullFace(a.FRONT_AND_BACK))):xe(a.CULL_FACE),I=L}function ft(L){L!==D&&(W&&a.lineWidth(L),D=L)}function Me(L,ae,ce){L?(Z(a.POLYGON_OFFSET_FILL),(z!==ae||H!==ce)&&(a.polygonOffset(ae,ce),z=ae,H=ce)):xe(a.POLYGON_OFFSET_FILL)}function Ve(L){L?Z(a.SCISSOR_TEST):xe(a.SCISSOR_TEST)}function wt(L){L===void 0&&(L=a.TEXTURE0+j-1),re!==L&&(a.activeTexture(L),re=L)}function _t(L,ae,ce){ce===void 0&&(re===null?ce=a.TEXTURE0+j-1:ce=re);let _e=le[ce];_e===void 0&&(_e={type:void 0,texture:void 0},le[ce]=_e),(_e.type!==L||_e.texture!==ae)&&(re!==ce&&(a.activeTexture(ce),re=ce),a.bindTexture(L,ae||K[L]),_e.type=L,_e.texture=ae)}function k(){let L=le[re];L!==void 0&&L.type!==void 0&&(a.bindTexture(L.type,null),L.type=void 0,L.texture=void 0)}function b(){try{a.compressedTexImage2D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function O(){try{a.compressedTexImage3D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function $(){try{a.texSubImage2D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function Q(){try{a.texSubImage3D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function Y(){try{a.compressedTexSubImage2D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function Ee(){try{a.compressedTexSubImage3D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function oe(){try{a.texStorage2D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function Se(){try{a.texStorage3D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function we(){try{a.texImage2D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function ie(){try{a.texImage3D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function fe(L){et.equals(L)===!1&&(a.scissor(L.x,L.y,L.z,L.w),et.copy(L))}function De(L){st.equals(L)===!1&&(a.viewport(L.x,L.y,L.z,L.w),st.copy(L))}function Te(L,ae){let ce=c.get(ae);ce===void 0&&(ce=new WeakMap,c.set(ae,ce));let _e=ce.get(L);_e===void 0&&(_e=a.getUniformBlockIndex(ae,L.name),ce.set(L,_e))}function he(L,ae){let _e=c.get(ae).get(L);u.get(ae)!==_e&&(a.uniformBlockBinding(ae,_e,L.__bindingPointIndex),u.set(ae,_e))}function He(){a.disable(a.BLEND),a.disable(a.CULL_FACE),a.disable(a.DEPTH_TEST),a.disable(a.POLYGON_OFFSET_FILL),a.disable(a.SCISSOR_TEST),a.disable(a.STENCIL_TEST),a.disable(a.SAMPLE_ALPHA_TO_COVERAGE),a.blendEquation(a.FUNC_ADD),a.blendFunc(a.ONE,a.ZERO),a.blendFuncSeparate(a.ONE,a.ZERO,a.ONE,a.ZERO),a.blendColor(0,0,0,0),a.colorMask(!0,!0,!0,!0),a.clearColor(0,0,0,0),a.depthMask(!0),a.depthFunc(a.LESS),o.setReversed(!1),a.clearDepth(1),a.stencilMask(4294967295),a.stencilFunc(a.ALWAYS,0,4294967295),a.stencilOp(a.KEEP,a.KEEP,a.KEEP),a.clearStencil(0),a.cullFace(a.BACK),a.frontFace(a.CCW),a.polygonOffset(0,0),a.activeTexture(a.TEXTURE0),a.bindFramebuffer(a.FRAMEBUFFER,null),a.bindFramebuffer(a.DRAW_FRAMEBUFFER,null),a.bindFramebuffer(a.READ_FRAMEBUFFER,null),a.useProgram(null),a.lineWidth(1),a.scissor(0,0,a.canvas.width,a.canvas.height),a.viewport(0,0,a.canvas.width,a.canvas.height),h={},re=null,le={},f={},p=new WeakMap,g=[],y=null,v=!1,m=null,d=null,T=null,_=null,x=null,A=null,E=null,C=new Oe(0,0,0),P=0,M=!1,w=null,I=null,D=null,z=null,H=null,et.set(0,0,a.canvas.width,a.canvas.height),st.set(0,0,a.canvas.width,a.canvas.height),r.reset(),o.reset(),l.reset()}return{buffers:{color:r,depth:o,stencil:l},enable:Z,disable:xe,bindFramebuffer:Ue,drawBuffers:se,useProgram:Re,setBlending:Ke,setMaterial:Pe,setFlipSided:ke,setCullFace:ye,setLineWidth:ft,setPolygonOffset:Me,setScissorTest:Ve,activeTexture:wt,bindTexture:_t,unbindTexture:k,compressedTexImage2D:b,compressedTexImage3D:O,texImage2D:we,texImage3D:ie,updateUBOMapping:Te,uniformBlockBinding:he,texStorage2D:oe,texStorage3D:Se,texSubImage2D:$,texSubImage3D:Q,compressedTexSubImage2D:Y,compressedTexSubImage3D:Ee,scissor:fe,viewport:De,reset:He}}function Pg(a,e,n,i,s,r,o){let l=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,u=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Be,h=new WeakMap,f,p=new WeakMap,g=!1;try{g=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function y(k,b){return g?new OffscreenCanvas(k,b):Ra("canvas")}function v(k,b,O){let $=1,Q=_t(k);if((Q.width>O||Q.height>O)&&($=O/Math.max(Q.width,Q.height)),$<1)if(typeof HTMLImageElement<"u"&&k instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&k instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&k instanceof ImageBitmap||typeof VideoFrame<"u"&&k instanceof VideoFrame){let Y=Math.floor($*Q.width),Ee=Math.floor($*Q.height);f===void 0&&(f=y(Y,Ee));let oe=b?y(Y,Ee):f;return oe.width=Y,oe.height=Ee,oe.getContext("2d").drawImage(k,0,0,Y,Ee),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+Q.width+"x"+Q.height+") to ("+Y+"x"+Ee+")."),oe}else return"data"in k&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+Q.width+"x"+Q.height+")."),k;return k}function m(k){return k.generateMipmaps}function d(k){a.generateMipmap(k)}function T(k){return k.isWebGLCubeRenderTarget?a.TEXTURE_CUBE_MAP:k.isWebGL3DRenderTarget?a.TEXTURE_3D:k.isWebGLArrayRenderTarget||k.isCompressedArrayTexture?a.TEXTURE_2D_ARRAY:a.TEXTURE_2D}function _(k,b,O,$,Q=!1){if(k!==null){if(a[k]!==void 0)return a[k];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+k+"'")}let Y=b;if(b===a.RED&&(O===a.FLOAT&&(Y=a.R32F),O===a.HALF_FLOAT&&(Y=a.R16F),O===a.UNSIGNED_BYTE&&(Y=a.R8)),b===a.RED_INTEGER&&(O===a.UNSIGNED_BYTE&&(Y=a.R8UI),O===a.UNSIGNED_SHORT&&(Y=a.R16UI),O===a.UNSIGNED_INT&&(Y=a.R32UI),O===a.BYTE&&(Y=a.R8I),O===a.SHORT&&(Y=a.R16I),O===a.INT&&(Y=a.R32I)),b===a.RG&&(O===a.FLOAT&&(Y=a.RG32F),O===a.HALF_FLOAT&&(Y=a.RG16F),O===a.UNSIGNED_BYTE&&(Y=a.RG8)),b===a.RG_INTEGER&&(O===a.UNSIGNED_BYTE&&(Y=a.RG8UI),O===a.UNSIGNED_SHORT&&(Y=a.RG16UI),O===a.UNSIGNED_INT&&(Y=a.RG32UI),O===a.BYTE&&(Y=a.RG8I),O===a.SHORT&&(Y=a.RG16I),O===a.INT&&(Y=a.RG32I)),b===a.RGB_INTEGER&&(O===a.UNSIGNED_BYTE&&(Y=a.RGB8UI),O===a.UNSIGNED_SHORT&&(Y=a.RGB16UI),O===a.UNSIGNED_INT&&(Y=a.RGB32UI),O===a.BYTE&&(Y=a.RGB8I),O===a.SHORT&&(Y=a.RGB16I),O===a.INT&&(Y=a.RGB32I)),b===a.RGBA_INTEGER&&(O===a.UNSIGNED_BYTE&&(Y=a.RGBA8UI),O===a.UNSIGNED_SHORT&&(Y=a.RGBA16UI),O===a.UNSIGNED_INT&&(Y=a.RGBA32UI),O===a.BYTE&&(Y=a.RGBA8I),O===a.SHORT&&(Y=a.RGBA16I),O===a.INT&&(Y=a.RGBA32I)),b===a.RGB&&(O===a.UNSIGNED_INT_5_9_9_9_REV&&(Y=a.RGB9_E5),O===a.UNSIGNED_INT_10F_11F_11F_REV&&(Y=a.R11F_G11F_B10F)),b===a.RGBA){let Ee=Q?ka:Ye.getTransfer($);O===a.FLOAT&&(Y=a.RGBA32F),O===a.HALF_FLOAT&&(Y=a.RGBA16F),O===a.UNSIGNED_BYTE&&(Y=Ee===nt?a.SRGB8_ALPHA8:a.RGBA8),O===a.UNSIGNED_SHORT_4_4_4_4&&(Y=a.RGBA4),O===a.UNSIGNED_SHORT_5_5_5_1&&(Y=a.RGB5_A1)}return(Y===a.R16F||Y===a.R32F||Y===a.RG16F||Y===a.RG32F||Y===a.RGBA16F||Y===a.RGBA32F)&&e.get("EXT_color_buffer_float"),Y}function x(k,b){let O;return k?b===null||b===Kn||b===ia?O=a.DEPTH24_STENCIL8:b===xn?O=a.DEPTH32F_STENCIL8:b===ta&&(O=a.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):b===null||b===Kn||b===ia?O=a.DEPTH_COMPONENT24:b===xn?O=a.DEPTH_COMPONENT32F:b===ta&&(O=a.DEPTH_COMPONENT16),O}function A(k,b){return m(k)===!0||k.isFramebufferTexture&&k.minFilter!==Qt&&k.minFilter!==on?Math.log2(Math.max(b.width,b.height))+1:k.mipmaps!==void 0&&k.mipmaps.length>0?k.mipmaps.length:k.isCompressedTexture&&Array.isArray(k.image)?b.mipmaps.length:1}function E(k){let b=k.target;b.removeEventListener("dispose",E),P(b),b.isVideoTexture&&h.delete(b)}function C(k){let b=k.target;b.removeEventListener("dispose",C),w(b)}function P(k){let b=i.get(k);if(b.__webglInit===void 0)return;let O=k.source,$=p.get(O);if($){let Q=$[b.__cacheKey];Q.usedTimes--,Q.usedTimes===0&&M(k),Object.keys($).length===0&&p.delete(O)}i.remove(k)}function M(k){let b=i.get(k);a.deleteTexture(b.__webglTexture);let O=k.source,$=p.get(O);delete $[b.__cacheKey],o.memory.textures--}function w(k){let b=i.get(k);if(k.depthTexture&&(k.depthTexture.dispose(),i.remove(k.depthTexture)),k.isWebGLCubeRenderTarget)for(let $=0;$<6;$++){if(Array.isArray(b.__webglFramebuffer[$]))for(let Q=0;Q<b.__webglFramebuffer[$].length;Q++)a.deleteFramebuffer(b.__webglFramebuffer[$][Q]);else a.deleteFramebuffer(b.__webglFramebuffer[$]);b.__webglDepthbuffer&&a.deleteRenderbuffer(b.__webglDepthbuffer[$])}else{if(Array.isArray(b.__webglFramebuffer))for(let $=0;$<b.__webglFramebuffer.length;$++)a.deleteFramebuffer(b.__webglFramebuffer[$]);else a.deleteFramebuffer(b.__webglFramebuffer);if(b.__webglDepthbuffer&&a.deleteRenderbuffer(b.__webglDepthbuffer),b.__webglMultisampledFramebuffer&&a.deleteFramebuffer(b.__webglMultisampledFramebuffer),b.__webglColorRenderbuffer)for(let $=0;$<b.__webglColorRenderbuffer.length;$++)b.__webglColorRenderbuffer[$]&&a.deleteRenderbuffer(b.__webglColorRenderbuffer[$]);b.__webglDepthRenderbuffer&&a.deleteRenderbuffer(b.__webglDepthRenderbuffer)}let O=k.textures;for(let $=0,Q=O.length;$<Q;$++){let Y=i.get(O[$]);Y.__webglTexture&&(a.deleteTexture(Y.__webglTexture),o.memory.textures--),i.remove(O[$])}i.remove(k)}let I=0;function D(){I=0}function z(){let k=I;return k>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+k+" texture units while this GPU supports only "+s.maxTextures),I+=1,k}function H(k){let b=[];return b.push(k.wrapS),b.push(k.wrapT),b.push(k.wrapR||0),b.push(k.magFilter),b.push(k.minFilter),b.push(k.anisotropy),b.push(k.internalFormat),b.push(k.format),b.push(k.type),b.push(k.generateMipmaps),b.push(k.premultiplyAlpha),b.push(k.flipY),b.push(k.unpackAlignment),b.push(k.colorSpace),b.join()}function j(k,b){let O=i.get(k);if(k.isVideoTexture&&Ve(k),k.isRenderTargetTexture===!1&&k.isExternalTexture!==!0&&k.version>0&&O.__version!==k.version){let $=k.image;if($===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if($.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{K(O,k,b);return}}else k.isExternalTexture&&(O.__webglTexture=k.sourceTexture?k.sourceTexture:null);n.bindTexture(a.TEXTURE_2D,O.__webglTexture,a.TEXTURE0+b)}function W(k,b){let O=i.get(k);if(k.isRenderTargetTexture===!1&&k.version>0&&O.__version!==k.version){K(O,k,b);return}n.bindTexture(a.TEXTURE_2D_ARRAY,O.__webglTexture,a.TEXTURE0+b)}function ne(k,b){let O=i.get(k);if(k.isRenderTargetTexture===!1&&k.version>0&&O.__version!==k.version){K(O,k,b);return}n.bindTexture(a.TEXTURE_3D,O.__webglTexture,a.TEXTURE0+b)}function X(k,b){let O=i.get(k);if(k.version>0&&O.__version!==k.version){Z(O,k,b);return}n.bindTexture(a.TEXTURE_CUBE_MAP,O.__webglTexture,a.TEXTURE0+b)}let re={[Ws]:a.REPEAT,[Hn]:a.CLAMP_TO_EDGE,[Xs]:a.MIRRORED_REPEAT},le={[Qt]:a.NEAREST,[du]:a.NEAREST_MIPMAP_NEAREST,[Qa]:a.NEAREST_MIPMAP_LINEAR,[on]:a.LINEAR,[kr]:a.LINEAR_MIPMAP_NEAREST,[$n]:a.LINEAR_MIPMAP_LINEAR},pe={[gu]:a.NEVER,[Mu]:a.ALWAYS,[yu]:a.LESS,[wl]:a.LEQUAL,[xu]:a.EQUAL,[vu]:a.GEQUAL,[_u]:a.GREATER,[bu]:a.NOTEQUAL};function Le(k,b){if(b.type===xn&&e.has("OES_texture_float_linear")===!1&&(b.magFilter===on||b.magFilter===kr||b.magFilter===Qa||b.magFilter===$n||b.minFilter===on||b.minFilter===kr||b.minFilter===Qa||b.minFilter===$n)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),a.texParameteri(k,a.TEXTURE_WRAP_S,re[b.wrapS]),a.texParameteri(k,a.TEXTURE_WRAP_T,re[b.wrapT]),(k===a.TEXTURE_3D||k===a.TEXTURE_2D_ARRAY)&&a.texParameteri(k,a.TEXTURE_WRAP_R,re[b.wrapR]),a.texParameteri(k,a.TEXTURE_MAG_FILTER,le[b.magFilter]),a.texParameteri(k,a.TEXTURE_MIN_FILTER,le[b.minFilter]),b.compareFunction&&(a.texParameteri(k,a.TEXTURE_COMPARE_MODE,a.COMPARE_REF_TO_TEXTURE),a.texParameteri(k,a.TEXTURE_COMPARE_FUNC,pe[b.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(b.magFilter===Qt||b.minFilter!==Qa&&b.minFilter!==$n||b.type===xn&&e.has("OES_texture_float_linear")===!1)return;if(b.anisotropy>1||i.get(b).__currentAnisotropy){let O=e.get("EXT_texture_filter_anisotropic");a.texParameterf(k,O.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(b.anisotropy,s.getMaxAnisotropy())),i.get(b).__currentAnisotropy=b.anisotropy}}}function et(k,b){let O=!1;k.__webglInit===void 0&&(k.__webglInit=!0,b.addEventListener("dispose",E));let $=b.source,Q=p.get($);Q===void 0&&(Q={},p.set($,Q));let Y=H(b);if(Y!==k.__cacheKey){Q[Y]===void 0&&(Q[Y]={texture:a.createTexture(),usedTimes:0},o.memory.textures++,O=!0),Q[Y].usedTimes++;let Ee=Q[k.__cacheKey];Ee!==void 0&&(Q[k.__cacheKey].usedTimes--,Ee.usedTimes===0&&M(b)),k.__cacheKey=Y,k.__webglTexture=Q[Y].texture}return O}function st(k,b,O){return Math.floor(Math.floor(k/O)/b)}function qe(k,b,O,$){let Y=k.updateRanges;if(Y.length===0)n.texSubImage2D(a.TEXTURE_2D,0,0,0,b.width,b.height,O,$,b.data);else{Y.sort((ie,fe)=>ie.start-fe.start);let Ee=0;for(let ie=1;ie<Y.length;ie++){let fe=Y[Ee],De=Y[ie],Te=fe.start+fe.count,he=st(De.start,b.width,4),He=st(fe.start,b.width,4);De.start<=Te+1&&he===He&&st(De.start+De.count-1,b.width,4)===he?fe.count=Math.max(fe.count,De.start+De.count-fe.start):(++Ee,Y[Ee]=De)}Y.length=Ee+1;let oe=a.getParameter(a.UNPACK_ROW_LENGTH),Se=a.getParameter(a.UNPACK_SKIP_PIXELS),we=a.getParameter(a.UNPACK_SKIP_ROWS);a.pixelStorei(a.UNPACK_ROW_LENGTH,b.width);for(let ie=0,fe=Y.length;ie<fe;ie++){let De=Y[ie],Te=Math.floor(De.start/4),he=Math.ceil(De.count/4),He=Te%b.width,L=Math.floor(Te/b.width),ae=he,ce=1;a.pixelStorei(a.UNPACK_SKIP_PIXELS,He),a.pixelStorei(a.UNPACK_SKIP_ROWS,L),n.texSubImage2D(a.TEXTURE_2D,0,He,L,ae,ce,O,$,b.data)}k.clearUpdateRanges(),a.pixelStorei(a.UNPACK_ROW_LENGTH,oe),a.pixelStorei(a.UNPACK_SKIP_PIXELS,Se),a.pixelStorei(a.UNPACK_SKIP_ROWS,we)}}function K(k,b,O){let $=a.TEXTURE_2D;(b.isDataArrayTexture||b.isCompressedArrayTexture)&&($=a.TEXTURE_2D_ARRAY),b.isData3DTexture&&($=a.TEXTURE_3D);let Q=et(k,b),Y=b.source;n.bindTexture($,k.__webglTexture,a.TEXTURE0+O);let Ee=i.get(Y);if(Y.version!==Ee.__version||Q===!0){n.activeTexture(a.TEXTURE0+O);let oe=Ye.getPrimaries(Ye.workingColorSpace),Se=b.colorSpace===Dn?null:Ye.getPrimaries(b.colorSpace),we=b.colorSpace===Dn||oe===Se?a.NONE:a.BROWSER_DEFAULT_WEBGL;a.pixelStorei(a.UNPACK_FLIP_Y_WEBGL,b.flipY),a.pixelStorei(a.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),a.pixelStorei(a.UNPACK_ALIGNMENT,b.unpackAlignment),a.pixelStorei(a.UNPACK_COLORSPACE_CONVERSION_WEBGL,we);let ie=v(b.image,!1,s.maxTextureSize);ie=wt(b,ie);let fe=r.convert(b.format,b.colorSpace),De=r.convert(b.type),Te=_(b.internalFormat,fe,De,b.colorSpace,b.isVideoTexture);Le($,b);let he,He=b.mipmaps,L=b.isVideoTexture!==!0,ae=Ee.__version===void 0||Q===!0,ce=Y.dataReady,_e=A(b,ie);if(b.isDepthTexture)Te=x(b.format===aa,b.type),ae&&(L?n.texStorage2D(a.TEXTURE_2D,1,Te,ie.width,ie.height):n.texImage2D(a.TEXTURE_2D,0,Te,ie.width,ie.height,0,fe,De,null));else if(b.isDataTexture)if(He.length>0){L&&ae&&n.texStorage2D(a.TEXTURE_2D,_e,Te,He[0].width,He[0].height);for(let ee=0,J=He.length;ee<J;ee++)he=He[ee],L?ce&&n.texSubImage2D(a.TEXTURE_2D,ee,0,0,he.width,he.height,fe,De,he.data):n.texImage2D(a.TEXTURE_2D,ee,Te,he.width,he.height,0,fe,De,he.data);b.generateMipmaps=!1}else L?(ae&&n.texStorage2D(a.TEXTURE_2D,_e,Te,ie.width,ie.height),ce&&qe(b,ie,fe,De)):n.texImage2D(a.TEXTURE_2D,0,Te,ie.width,ie.height,0,fe,De,ie.data);else if(b.isCompressedTexture)if(b.isCompressedArrayTexture){L&&ae&&n.texStorage3D(a.TEXTURE_2D_ARRAY,_e,Te,He[0].width,He[0].height,ie.depth);for(let ee=0,J=He.length;ee<J;ee++)if(he=He[ee],b.format!==en)if(fe!==null)if(L){if(ce)if(b.layerUpdates.size>0){let ve=Rl(he.width,he.height,b.format,b.type);for(let Fe of b.layerUpdates){let lt=he.data.subarray(Fe*ve/he.data.BYTES_PER_ELEMENT,(Fe+1)*ve/he.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(a.TEXTURE_2D_ARRAY,ee,0,0,Fe,he.width,he.height,1,fe,lt)}b.clearLayerUpdates()}else n.compressedTexSubImage3D(a.TEXTURE_2D_ARRAY,ee,0,0,0,he.width,he.height,ie.depth,fe,he.data)}else n.compressedTexImage3D(a.TEXTURE_2D_ARRAY,ee,Te,he.width,he.height,ie.depth,0,he.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else L?ce&&n.texSubImage3D(a.TEXTURE_2D_ARRAY,ee,0,0,0,he.width,he.height,ie.depth,fe,De,he.data):n.texImage3D(a.TEXTURE_2D_ARRAY,ee,Te,he.width,he.height,ie.depth,0,fe,De,he.data)}else{L&&ae&&n.texStorage2D(a.TEXTURE_2D,_e,Te,He[0].width,He[0].height);for(let ee=0,J=He.length;ee<J;ee++)he=He[ee],b.format!==en?fe!==null?L?ce&&n.compressedTexSubImage2D(a.TEXTURE_2D,ee,0,0,he.width,he.height,fe,he.data):n.compressedTexImage2D(a.TEXTURE_2D,ee,Te,he.width,he.height,0,he.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):L?ce&&n.texSubImage2D(a.TEXTURE_2D,ee,0,0,he.width,he.height,fe,De,he.data):n.texImage2D(a.TEXTURE_2D,ee,Te,he.width,he.height,0,fe,De,he.data)}else if(b.isDataArrayTexture)if(L){if(ae&&n.texStorage3D(a.TEXTURE_2D_ARRAY,_e,Te,ie.width,ie.height,ie.depth),ce)if(b.layerUpdates.size>0){let ee=Rl(ie.width,ie.height,b.format,b.type);for(let J of b.layerUpdates){let ve=ie.data.subarray(J*ee/ie.data.BYTES_PER_ELEMENT,(J+1)*ee/ie.data.BYTES_PER_ELEMENT);n.texSubImage3D(a.TEXTURE_2D_ARRAY,0,0,0,J,ie.width,ie.height,1,fe,De,ve)}b.clearLayerUpdates()}else n.texSubImage3D(a.TEXTURE_2D_ARRAY,0,0,0,0,ie.width,ie.height,ie.depth,fe,De,ie.data)}else n.texImage3D(a.TEXTURE_2D_ARRAY,0,Te,ie.width,ie.height,ie.depth,0,fe,De,ie.data);else if(b.isData3DTexture)L?(ae&&n.texStorage3D(a.TEXTURE_3D,_e,Te,ie.width,ie.height,ie.depth),ce&&n.texSubImage3D(a.TEXTURE_3D,0,0,0,0,ie.width,ie.height,ie.depth,fe,De,ie.data)):n.texImage3D(a.TEXTURE_3D,0,Te,ie.width,ie.height,ie.depth,0,fe,De,ie.data);else if(b.isFramebufferTexture){if(ae)if(L)n.texStorage2D(a.TEXTURE_2D,_e,Te,ie.width,ie.height);else{let ee=ie.width,J=ie.height;for(let ve=0;ve<_e;ve++)n.texImage2D(a.TEXTURE_2D,ve,Te,ee,J,0,fe,De,null),ee>>=1,J>>=1}}else if(He.length>0){if(L&&ae){let ee=_t(He[0]);n.texStorage2D(a.TEXTURE_2D,_e,Te,ee.width,ee.height)}for(let ee=0,J=He.length;ee<J;ee++)he=He[ee],L?ce&&n.texSubImage2D(a.TEXTURE_2D,ee,0,0,fe,De,he):n.texImage2D(a.TEXTURE_2D,ee,Te,fe,De,he);b.generateMipmaps=!1}else if(L){if(ae){let ee=_t(ie);n.texStorage2D(a.TEXTURE_2D,_e,Te,ee.width,ee.height)}ce&&n.texSubImage2D(a.TEXTURE_2D,0,0,0,fe,De,ie)}else n.texImage2D(a.TEXTURE_2D,0,Te,fe,De,ie);m(b)&&d($),Ee.__version=Y.version,b.onUpdate&&b.onUpdate(b)}k.__version=b.version}function Z(k,b,O){if(b.image.length!==6)return;let $=et(k,b),Q=b.source;n.bindTexture(a.TEXTURE_CUBE_MAP,k.__webglTexture,a.TEXTURE0+O);let Y=i.get(Q);if(Q.version!==Y.__version||$===!0){n.activeTexture(a.TEXTURE0+O);let Ee=Ye.getPrimaries(Ye.workingColorSpace),oe=b.colorSpace===Dn?null:Ye.getPrimaries(b.colorSpace),Se=b.colorSpace===Dn||Ee===oe?a.NONE:a.BROWSER_DEFAULT_WEBGL;a.pixelStorei(a.UNPACK_FLIP_Y_WEBGL,b.flipY),a.pixelStorei(a.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),a.pixelStorei(a.UNPACK_ALIGNMENT,b.unpackAlignment),a.pixelStorei(a.UNPACK_COLORSPACE_CONVERSION_WEBGL,Se);let we=b.isCompressedTexture||b.image[0].isCompressedTexture,ie=b.image[0]&&b.image[0].isDataTexture,fe=[];for(let J=0;J<6;J++)!we&&!ie?fe[J]=v(b.image[J],!0,s.maxCubemapSize):fe[J]=ie?b.image[J].image:b.image[J],fe[J]=wt(b,fe[J]);let De=fe[0],Te=r.convert(b.format,b.colorSpace),he=r.convert(b.type),He=_(b.internalFormat,Te,he,b.colorSpace),L=b.isVideoTexture!==!0,ae=Y.__version===void 0||$===!0,ce=Q.dataReady,_e=A(b,De);Le(a.TEXTURE_CUBE_MAP,b);let ee;if(we){L&&ae&&n.texStorage2D(a.TEXTURE_CUBE_MAP,_e,He,De.width,De.height);for(let J=0;J<6;J++){ee=fe[J].mipmaps;for(let ve=0;ve<ee.length;ve++){let Fe=ee[ve];b.format!==en?Te!==null?L?ce&&n.compressedTexSubImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+J,ve,0,0,Fe.width,Fe.height,Te,Fe.data):n.compressedTexImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+J,ve,He,Fe.width,Fe.height,0,Fe.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):L?ce&&n.texSubImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+J,ve,0,0,Fe.width,Fe.height,Te,he,Fe.data):n.texImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+J,ve,He,Fe.width,Fe.height,0,Te,he,Fe.data)}}}else{if(ee=b.mipmaps,L&&ae){ee.length>0&&_e++;let J=_t(fe[0]);n.texStorage2D(a.TEXTURE_CUBE_MAP,_e,He,J.width,J.height)}for(let J=0;J<6;J++)if(ie){L?ce&&n.texSubImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,0,0,fe[J].width,fe[J].height,Te,he,fe[J].data):n.texImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,He,fe[J].width,fe[J].height,0,Te,he,fe[J].data);for(let ve=0;ve<ee.length;ve++){let lt=ee[ve].image[J].image;L?ce&&n.texSubImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+J,ve+1,0,0,lt.width,lt.height,Te,he,lt.data):n.texImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+J,ve+1,He,lt.width,lt.height,0,Te,he,lt.data)}}else{L?ce&&n.texSubImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,0,0,Te,he,fe[J]):n.texImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,He,Te,he,fe[J]);for(let ve=0;ve<ee.length;ve++){let Fe=ee[ve];L?ce&&n.texSubImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+J,ve+1,0,0,Te,he,Fe.image[J]):n.texImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+J,ve+1,He,Te,he,Fe.image[J])}}}m(b)&&d(a.TEXTURE_CUBE_MAP),Y.__version=Q.version,b.onUpdate&&b.onUpdate(b)}k.__version=b.version}function xe(k,b,O,$,Q,Y){let Ee=r.convert(O.format,O.colorSpace),oe=r.convert(O.type),Se=_(O.internalFormat,Ee,oe,O.colorSpace),we=i.get(b),ie=i.get(O);if(ie.__renderTarget=b,!we.__hasExternalTextures){let fe=Math.max(1,b.width>>Y),De=Math.max(1,b.height>>Y);Q===a.TEXTURE_3D||Q===a.TEXTURE_2D_ARRAY?n.texImage3D(Q,Y,Se,fe,De,b.depth,0,Ee,oe,null):n.texImage2D(Q,Y,Se,fe,De,0,Ee,oe,null)}n.bindFramebuffer(a.FRAMEBUFFER,k),Me(b)?l.framebufferTexture2DMultisampleEXT(a.FRAMEBUFFER,$,Q,ie.__webglTexture,0,ft(b)):(Q===a.TEXTURE_2D||Q>=a.TEXTURE_CUBE_MAP_POSITIVE_X&&Q<=a.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&a.framebufferTexture2D(a.FRAMEBUFFER,$,Q,ie.__webglTexture,Y),n.bindFramebuffer(a.FRAMEBUFFER,null)}function Ue(k,b,O){if(a.bindRenderbuffer(a.RENDERBUFFER,k),b.depthBuffer){let $=b.depthTexture,Q=$&&$.isDepthTexture?$.type:null,Y=x(b.stencilBuffer,Q),Ee=b.stencilBuffer?a.DEPTH_STENCIL_ATTACHMENT:a.DEPTH_ATTACHMENT,oe=ft(b);Me(b)?l.renderbufferStorageMultisampleEXT(a.RENDERBUFFER,oe,Y,b.width,b.height):O?a.renderbufferStorageMultisample(a.RENDERBUFFER,oe,Y,b.width,b.height):a.renderbufferStorage(a.RENDERBUFFER,Y,b.width,b.height),a.framebufferRenderbuffer(a.FRAMEBUFFER,Ee,a.RENDERBUFFER,k)}else{let $=b.textures;for(let Q=0;Q<$.length;Q++){let Y=$[Q],Ee=r.convert(Y.format,Y.colorSpace),oe=r.convert(Y.type),Se=_(Y.internalFormat,Ee,oe,Y.colorSpace),we=ft(b);O&&Me(b)===!1?a.renderbufferStorageMultisample(a.RENDERBUFFER,we,Se,b.width,b.height):Me(b)?l.renderbufferStorageMultisampleEXT(a.RENDERBUFFER,we,Se,b.width,b.height):a.renderbufferStorage(a.RENDERBUFFER,Se,b.width,b.height)}}a.bindRenderbuffer(a.RENDERBUFFER,null)}function se(k,b){if(b&&b.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(n.bindFramebuffer(a.FRAMEBUFFER,k),!(b.depthTexture&&b.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");let $=i.get(b.depthTexture);$.__renderTarget=b,(!$.__webglTexture||b.depthTexture.image.width!==b.width||b.depthTexture.image.height!==b.height)&&(b.depthTexture.image.width=b.width,b.depthTexture.image.height=b.height,b.depthTexture.needsUpdate=!0),j(b.depthTexture,0);let Q=$.__webglTexture,Y=ft(b);if(b.depthTexture.format===Xi)Me(b)?l.framebufferTexture2DMultisampleEXT(a.FRAMEBUFFER,a.DEPTH_ATTACHMENT,a.TEXTURE_2D,Q,0,Y):a.framebufferTexture2D(a.FRAMEBUFFER,a.DEPTH_ATTACHMENT,a.TEXTURE_2D,Q,0);else if(b.depthTexture.format===aa)Me(b)?l.framebufferTexture2DMultisampleEXT(a.FRAMEBUFFER,a.DEPTH_STENCIL_ATTACHMENT,a.TEXTURE_2D,Q,0,Y):a.framebufferTexture2D(a.FRAMEBUFFER,a.DEPTH_STENCIL_ATTACHMENT,a.TEXTURE_2D,Q,0);else throw new Error("Unknown depthTexture format")}function Re(k){let b=i.get(k),O=k.isWebGLCubeRenderTarget===!0;if(b.__boundDepthTexture!==k.depthTexture){let $=k.depthTexture;if(b.__depthDisposeCallback&&b.__depthDisposeCallback(),$){let Q=()=>{delete b.__boundDepthTexture,delete b.__depthDisposeCallback,$.removeEventListener("dispose",Q)};$.addEventListener("dispose",Q),b.__depthDisposeCallback=Q}b.__boundDepthTexture=$}if(k.depthTexture&&!b.__autoAllocateDepthBuffer){if(O)throw new Error("target.depthTexture not supported in Cube render targets");let $=k.texture.mipmaps;$&&$.length>0?se(b.__webglFramebuffer[0],k):se(b.__webglFramebuffer,k)}else if(O){b.__webglDepthbuffer=[];for(let $=0;$<6;$++)if(n.bindFramebuffer(a.FRAMEBUFFER,b.__webglFramebuffer[$]),b.__webglDepthbuffer[$]===void 0)b.__webglDepthbuffer[$]=a.createRenderbuffer(),Ue(b.__webglDepthbuffer[$],k,!1);else{let Q=k.stencilBuffer?a.DEPTH_STENCIL_ATTACHMENT:a.DEPTH_ATTACHMENT,Y=b.__webglDepthbuffer[$];a.bindRenderbuffer(a.RENDERBUFFER,Y),a.framebufferRenderbuffer(a.FRAMEBUFFER,Q,a.RENDERBUFFER,Y)}}else{let $=k.texture.mipmaps;if($&&$.length>0?n.bindFramebuffer(a.FRAMEBUFFER,b.__webglFramebuffer[0]):n.bindFramebuffer(a.FRAMEBUFFER,b.__webglFramebuffer),b.__webglDepthbuffer===void 0)b.__webglDepthbuffer=a.createRenderbuffer(),Ue(b.__webglDepthbuffer,k,!1);else{let Q=k.stencilBuffer?a.DEPTH_STENCIL_ATTACHMENT:a.DEPTH_ATTACHMENT,Y=b.__webglDepthbuffer;a.bindRenderbuffer(a.RENDERBUFFER,Y),a.framebufferRenderbuffer(a.FRAMEBUFFER,Q,a.RENDERBUFFER,Y)}}n.bindFramebuffer(a.FRAMEBUFFER,null)}function ut(k,b,O){let $=i.get(k);b!==void 0&&xe($.__webglFramebuffer,k,k.texture,a.COLOR_ATTACHMENT0,a.TEXTURE_2D,0),O!==void 0&&Re(k)}function R(k){let b=k.texture,O=i.get(k),$=i.get(b);k.addEventListener("dispose",C);let Q=k.textures,Y=k.isWebGLCubeRenderTarget===!0,Ee=Q.length>1;if(Ee||($.__webglTexture===void 0&&($.__webglTexture=a.createTexture()),$.__version=b.version,o.memory.textures++),Y){O.__webglFramebuffer=[];for(let oe=0;oe<6;oe++)if(b.mipmaps&&b.mipmaps.length>0){O.__webglFramebuffer[oe]=[];for(let Se=0;Se<b.mipmaps.length;Se++)O.__webglFramebuffer[oe][Se]=a.createFramebuffer()}else O.__webglFramebuffer[oe]=a.createFramebuffer()}else{if(b.mipmaps&&b.mipmaps.length>0){O.__webglFramebuffer=[];for(let oe=0;oe<b.mipmaps.length;oe++)O.__webglFramebuffer[oe]=a.createFramebuffer()}else O.__webglFramebuffer=a.createFramebuffer();if(Ee)for(let oe=0,Se=Q.length;oe<Se;oe++){let we=i.get(Q[oe]);we.__webglTexture===void 0&&(we.__webglTexture=a.createTexture(),o.memory.textures++)}if(k.samples>0&&Me(k)===!1){O.__webglMultisampledFramebuffer=a.createFramebuffer(),O.__webglColorRenderbuffer=[],n.bindFramebuffer(a.FRAMEBUFFER,O.__webglMultisampledFramebuffer);for(let oe=0;oe<Q.length;oe++){let Se=Q[oe];O.__webglColorRenderbuffer[oe]=a.createRenderbuffer(),a.bindRenderbuffer(a.RENDERBUFFER,O.__webglColorRenderbuffer[oe]);let we=r.convert(Se.format,Se.colorSpace),ie=r.convert(Se.type),fe=_(Se.internalFormat,we,ie,Se.colorSpace,k.isXRRenderTarget===!0),De=ft(k);a.renderbufferStorageMultisample(a.RENDERBUFFER,De,fe,k.width,k.height),a.framebufferRenderbuffer(a.FRAMEBUFFER,a.COLOR_ATTACHMENT0+oe,a.RENDERBUFFER,O.__webglColorRenderbuffer[oe])}a.bindRenderbuffer(a.RENDERBUFFER,null),k.depthBuffer&&(O.__webglDepthRenderbuffer=a.createRenderbuffer(),Ue(O.__webglDepthRenderbuffer,k,!0)),n.bindFramebuffer(a.FRAMEBUFFER,null)}}if(Y){n.bindTexture(a.TEXTURE_CUBE_MAP,$.__webglTexture),Le(a.TEXTURE_CUBE_MAP,b);for(let oe=0;oe<6;oe++)if(b.mipmaps&&b.mipmaps.length>0)for(let Se=0;Se<b.mipmaps.length;Se++)xe(O.__webglFramebuffer[oe][Se],k,b,a.COLOR_ATTACHMENT0,a.TEXTURE_CUBE_MAP_POSITIVE_X+oe,Se);else xe(O.__webglFramebuffer[oe],k,b,a.COLOR_ATTACHMENT0,a.TEXTURE_CUBE_MAP_POSITIVE_X+oe,0);m(b)&&d(a.TEXTURE_CUBE_MAP),n.unbindTexture()}else if(Ee){for(let oe=0,Se=Q.length;oe<Se;oe++){let we=Q[oe],ie=i.get(we),fe=a.TEXTURE_2D;(k.isWebGL3DRenderTarget||k.isWebGLArrayRenderTarget)&&(fe=k.isWebGL3DRenderTarget?a.TEXTURE_3D:a.TEXTURE_2D_ARRAY),n.bindTexture(fe,ie.__webglTexture),Le(fe,we),xe(O.__webglFramebuffer,k,we,a.COLOR_ATTACHMENT0+oe,fe,0),m(we)&&d(fe)}n.unbindTexture()}else{let oe=a.TEXTURE_2D;if((k.isWebGL3DRenderTarget||k.isWebGLArrayRenderTarget)&&(oe=k.isWebGL3DRenderTarget?a.TEXTURE_3D:a.TEXTURE_2D_ARRAY),n.bindTexture(oe,$.__webglTexture),Le(oe,b),b.mipmaps&&b.mipmaps.length>0)for(let Se=0;Se<b.mipmaps.length;Se++)xe(O.__webglFramebuffer[Se],k,b,a.COLOR_ATTACHMENT0,oe,Se);else xe(O.__webglFramebuffer,k,b,a.COLOR_ATTACHMENT0,oe,0);m(b)&&d(oe),n.unbindTexture()}k.depthBuffer&&Re(k)}function Ke(k){let b=k.textures;for(let O=0,$=b.length;O<$;O++){let Q=b[O];if(m(Q)){let Y=T(k),Ee=i.get(Q).__webglTexture;n.bindTexture(Y,Ee),d(Y),n.unbindTexture()}}}let Pe=[],ke=[];function ye(k){if(k.samples>0){if(Me(k)===!1){let b=k.textures,O=k.width,$=k.height,Q=a.COLOR_BUFFER_BIT,Y=k.stencilBuffer?a.DEPTH_STENCIL_ATTACHMENT:a.DEPTH_ATTACHMENT,Ee=i.get(k),oe=b.length>1;if(oe)for(let we=0;we<b.length;we++)n.bindFramebuffer(a.FRAMEBUFFER,Ee.__webglMultisampledFramebuffer),a.framebufferRenderbuffer(a.FRAMEBUFFER,a.COLOR_ATTACHMENT0+we,a.RENDERBUFFER,null),n.bindFramebuffer(a.FRAMEBUFFER,Ee.__webglFramebuffer),a.framebufferTexture2D(a.DRAW_FRAMEBUFFER,a.COLOR_ATTACHMENT0+we,a.TEXTURE_2D,null,0);n.bindFramebuffer(a.READ_FRAMEBUFFER,Ee.__webglMultisampledFramebuffer);let Se=k.texture.mipmaps;Se&&Se.length>0?n.bindFramebuffer(a.DRAW_FRAMEBUFFER,Ee.__webglFramebuffer[0]):n.bindFramebuffer(a.DRAW_FRAMEBUFFER,Ee.__webglFramebuffer);for(let we=0;we<b.length;we++){if(k.resolveDepthBuffer&&(k.depthBuffer&&(Q|=a.DEPTH_BUFFER_BIT),k.stencilBuffer&&k.resolveStencilBuffer&&(Q|=a.STENCIL_BUFFER_BIT)),oe){a.framebufferRenderbuffer(a.READ_FRAMEBUFFER,a.COLOR_ATTACHMENT0,a.RENDERBUFFER,Ee.__webglColorRenderbuffer[we]);let ie=i.get(b[we]).__webglTexture;a.framebufferTexture2D(a.DRAW_FRAMEBUFFER,a.COLOR_ATTACHMENT0,a.TEXTURE_2D,ie,0)}a.blitFramebuffer(0,0,O,$,0,0,O,$,Q,a.NEAREST),u===!0&&(Pe.length=0,ke.length=0,Pe.push(a.COLOR_ATTACHMENT0+we),k.depthBuffer&&k.resolveDepthBuffer===!1&&(Pe.push(Y),ke.push(Y),a.invalidateFramebuffer(a.DRAW_FRAMEBUFFER,ke)),a.invalidateFramebuffer(a.READ_FRAMEBUFFER,Pe))}if(n.bindFramebuffer(a.READ_FRAMEBUFFER,null),n.bindFramebuffer(a.DRAW_FRAMEBUFFER,null),oe)for(let we=0;we<b.length;we++){n.bindFramebuffer(a.FRAMEBUFFER,Ee.__webglMultisampledFramebuffer),a.framebufferRenderbuffer(a.FRAMEBUFFER,a.COLOR_ATTACHMENT0+we,a.RENDERBUFFER,Ee.__webglColorRenderbuffer[we]);let ie=i.get(b[we]).__webglTexture;n.bindFramebuffer(a.FRAMEBUFFER,Ee.__webglFramebuffer),a.framebufferTexture2D(a.DRAW_FRAMEBUFFER,a.COLOR_ATTACHMENT0+we,a.TEXTURE_2D,ie,0)}n.bindFramebuffer(a.DRAW_FRAMEBUFFER,Ee.__webglMultisampledFramebuffer)}else if(k.depthBuffer&&k.resolveDepthBuffer===!1&&u){let b=k.stencilBuffer?a.DEPTH_STENCIL_ATTACHMENT:a.DEPTH_ATTACHMENT;a.invalidateFramebuffer(a.DRAW_FRAMEBUFFER,[b])}}}function ft(k){return Math.min(s.maxSamples,k.samples)}function Me(k){let b=i.get(k);return k.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&b.__useRenderToTexture!==!1}function Ve(k){let b=o.render.frame;h.get(k)!==b&&(h.set(k,b),k.update())}function wt(k,b){let O=k.colorSpace,$=k.format,Q=k.type;return k.isCompressedTexture===!0||k.isVideoTexture===!0||O!==ui&&O!==Dn&&(Ye.getTransfer(O)===nt?($!==en||Q!==un)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",O)),b}function _t(k){return typeof HTMLImageElement<"u"&&k instanceof HTMLImageElement?(c.width=k.naturalWidth||k.width,c.height=k.naturalHeight||k.height):typeof VideoFrame<"u"&&k instanceof VideoFrame?(c.width=k.displayWidth,c.height=k.displayHeight):(c.width=k.width,c.height=k.height),c}this.allocateTextureUnit=z,this.resetTextureUnits=D,this.setTexture2D=j,this.setTexture2DArray=W,this.setTexture3D=ne,this.setTextureCube=X,this.rebindTextures=ut,this.setupRenderTarget=R,this.updateRenderTargetMipmap=Ke,this.updateMultisampleRenderTarget=ye,this.setupDepthRenderbuffer=Re,this.setupFrameBufferTexture=xe,this.useMultisampledRTT=Me}function Ig(a,e){function n(i,s=Dn){let r,o=Ye.getTransfer(s);if(i===un)return a.UNSIGNED_BYTE;if(i===Rr)return a.UNSIGNED_SHORT_4_4_4_4;if(i===Pr)return a.UNSIGNED_SHORT_5_5_5_1;if(i===yl)return a.UNSIGNED_INT_5_9_9_9_REV;if(i===xl)return a.UNSIGNED_INT_10F_11F_11F_REV;if(i===ml)return a.BYTE;if(i===gl)return a.SHORT;if(i===ta)return a.UNSIGNED_SHORT;if(i===Cr)return a.INT;if(i===Kn)return a.UNSIGNED_INT;if(i===xn)return a.FLOAT;if(i===na)return a.HALF_FLOAT;if(i===_l)return a.ALPHA;if(i===bl)return a.RGB;if(i===en)return a.RGBA;if(i===Xi)return a.DEPTH_COMPONENT;if(i===aa)return a.DEPTH_STENCIL;if(i===vl)return a.RED;if(i===Ir)return a.RED_INTEGER;if(i===Ml)return a.RG;if(i===Lr)return a.RG_INTEGER;if(i===Dr)return a.RGBA_INTEGER;if(i===es||i===ts||i===ns||i===is)if(o===nt)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===es)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===ts)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===ns)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===is)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===es)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===ts)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===ns)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===is)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===Ur||i===Nr||i===Fr||i===Br)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===Ur)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===Nr)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===Fr)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===Br)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===Or||i===zr||i===Hr)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(i===Or||i===zr)return o===nt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===Hr)return o===nt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(i===Vr||i===Gr||i===Wr||i===Xr||i===qr||i===jr||i===Yr||i===$r||i===Kr||i===Jr||i===Zr||i===Qr||i===eo||i===to)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(i===Vr)return o===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===Gr)return o===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===Wr)return o===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===Xr)return o===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===qr)return o===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===jr)return o===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===Yr)return o===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===$r)return o===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===Kr)return o===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===Jr)return o===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===Zr)return o===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===Qr)return o===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===eo)return o===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===to)return o===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===no||i===io||i===ao)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(i===no)return o===nt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===io)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===ao)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===so||i===ro||i===oo||i===lo)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(i===so)return r.COMPRESSED_RED_RGTC1_EXT;if(i===ro)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===oo)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===lo)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===ia?a.UNSIGNED_INT_24_8:a[i]!==void 0?a[i]:null}return{convert:n}}var Lg=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Dg=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,Gl=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,n){if(this.texture===null){let i=new Ha(e.texture);(e.depthNear!==n.depthNear||e.depthFar!==n.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=i}}getMesh(e){if(this.texture!==null&&this.mesh===null){let n=e.cameras[0].viewport,i=new cn({vertexShader:Lg,fragmentShader:Dg,uniforms:{depthColor:{value:this.texture},depthWidth:{value:n.z},depthHeight:{value:n.w}}});this.mesh=new yt(new pi(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Wl=class extends Rn{constructor(e,n){super();let i=this,s=null,r=1,o=null,l="local-floor",u=1,c=null,h=null,f=null,p=null,g=null,y=null,v=typeof XRWebGLBinding<"u",m=new Gl,d={},T=n.getContextAttributes(),_=null,x=null,A=[],E=[],C=new Be,P=null,M=new Pt;M.viewport=new gt;let w=new Pt;w.viewport=new gt;let I=[M,w],D=new gr,z=null,H=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(K){let Z=A[K];return Z===void 0&&(Z=new Ki,A[K]=Z),Z.getTargetRaySpace()},this.getControllerGrip=function(K){let Z=A[K];return Z===void 0&&(Z=new Ki,A[K]=Z),Z.getGripSpace()},this.getHand=function(K){let Z=A[K];return Z===void 0&&(Z=new Ki,A[K]=Z),Z.getHandSpace()};function j(K){let Z=E.indexOf(K.inputSource);if(Z===-1)return;let xe=A[Z];xe!==void 0&&(xe.update(K.inputSource,K.frame,c||o),xe.dispatchEvent({type:K.type,data:K.inputSource}))}function W(){s.removeEventListener("select",j),s.removeEventListener("selectstart",j),s.removeEventListener("selectend",j),s.removeEventListener("squeeze",j),s.removeEventListener("squeezestart",j),s.removeEventListener("squeezeend",j),s.removeEventListener("end",W),s.removeEventListener("inputsourceschange",ne);for(let K=0;K<A.length;K++){let Z=E[K];Z!==null&&(E[K]=null,A[K].disconnect(Z))}z=null,H=null,m.reset();for(let K in d)delete d[K];e.setRenderTarget(_),g=null,p=null,f=null,s=null,x=null,qe.stop(),i.isPresenting=!1,e.setPixelRatio(P),e.setSize(C.width,C.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(K){r=K,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(K){l=K,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(K){c=K},this.getBaseLayer=function(){return p!==null?p:g},this.getBinding=function(){return f===null&&v&&(f=new XRWebGLBinding(s,n)),f},this.getFrame=function(){return y},this.getSession=function(){return s},this.setSession=async function(K){if(s=K,s!==null){if(_=e.getRenderTarget(),s.addEventListener("select",j),s.addEventListener("selectstart",j),s.addEventListener("selectend",j),s.addEventListener("squeeze",j),s.addEventListener("squeezestart",j),s.addEventListener("squeezeend",j),s.addEventListener("end",W),s.addEventListener("inputsourceschange",ne),T.xrCompatible!==!0&&await n.makeXRCompatible(),P=e.getPixelRatio(),e.getSize(C),v&&"createProjectionLayer"in XRWebGLBinding.prototype){let xe=null,Ue=null,se=null;T.depth&&(se=T.stencil?n.DEPTH24_STENCIL8:n.DEPTH_COMPONENT24,xe=T.stencil?aa:Xi,Ue=T.stencil?ia:Kn);let Re={colorFormat:n.RGBA8,depthFormat:se,scaleFactor:r};f=this.getBinding(),p=f.createProjectionLayer(Re),s.updateRenderState({layers:[p]}),e.setPixelRatio(1),e.setSize(p.textureWidth,p.textureHeight,!1),x=new mn(p.textureWidth,p.textureHeight,{format:en,type:un,depthTexture:new za(p.textureWidth,p.textureHeight,Ue,void 0,void 0,void 0,void 0,void 0,void 0,xe),stencilBuffer:T.stencil,colorSpace:e.outputColorSpace,samples:T.antialias?4:0,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1})}else{let xe={antialias:T.antialias,alpha:!0,depth:T.depth,stencil:T.stencil,framebufferScaleFactor:r};g=new XRWebGLLayer(s,n,xe),s.updateRenderState({baseLayer:g}),e.setPixelRatio(1),e.setSize(g.framebufferWidth,g.framebufferHeight,!1),x=new mn(g.framebufferWidth,g.framebufferHeight,{format:en,type:un,colorSpace:e.outputColorSpace,stencilBuffer:T.stencil,resolveDepthBuffer:g.ignoreDepthValues===!1,resolveStencilBuffer:g.ignoreDepthValues===!1})}x.isXRRenderTarget=!0,this.setFoveation(u),c=null,o=await s.requestReferenceSpace(l),qe.setContext(s),qe.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function ne(K){for(let Z=0;Z<K.removed.length;Z++){let xe=K.removed[Z],Ue=E.indexOf(xe);Ue>=0&&(E[Ue]=null,A[Ue].disconnect(xe))}for(let Z=0;Z<K.added.length;Z++){let xe=K.added[Z],Ue=E.indexOf(xe);if(Ue===-1){for(let Re=0;Re<A.length;Re++)if(Re>=E.length){E.push(xe),Ue=Re;break}else if(E[Re]===null){E[Re]=xe,Ue=Re;break}if(Ue===-1)break}let se=A[Ue];se&&se.connect(xe)}}let X=new U,re=new U;function le(K,Z,xe){X.setFromMatrixPosition(Z.matrixWorld),re.setFromMatrixPosition(xe.matrixWorld);let Ue=X.distanceTo(re),se=Z.projectionMatrix.elements,Re=xe.projectionMatrix.elements,ut=se[14]/(se[10]-1),R=se[14]/(se[10]+1),Ke=(se[9]+1)/se[5],Pe=(se[9]-1)/se[5],ke=(se[8]-1)/se[0],ye=(Re[8]+1)/Re[0],ft=ut*ke,Me=ut*ye,Ve=Ue/(-ke+ye),wt=Ve*-ke;if(Z.matrixWorld.decompose(K.position,K.quaternion,K.scale),K.translateX(wt),K.translateZ(Ve),K.matrixWorld.compose(K.position,K.quaternion,K.scale),K.matrixWorldInverse.copy(K.matrixWorld).invert(),se[10]===-1)K.projectionMatrix.copy(Z.projectionMatrix),K.projectionMatrixInverse.copy(Z.projectionMatrixInverse);else{let _t=ut+Ve,k=R+Ve,b=ft-wt,O=Me+(Ue-wt),$=Ke*R/k*_t,Q=Pe*R/k*_t;K.projectionMatrix.makePerspective(b,O,$,Q,_t,k),K.projectionMatrixInverse.copy(K.projectionMatrix).invert()}}function pe(K,Z){Z===null?K.matrixWorld.copy(K.matrix):K.matrixWorld.multiplyMatrices(Z.matrixWorld,K.matrix),K.matrixWorldInverse.copy(K.matrixWorld).invert()}this.updateCamera=function(K){if(s===null)return;let Z=K.near,xe=K.far;m.texture!==null&&(m.depthNear>0&&(Z=m.depthNear),m.depthFar>0&&(xe=m.depthFar)),D.near=w.near=M.near=Z,D.far=w.far=M.far=xe,(z!==D.near||H!==D.far)&&(s.updateRenderState({depthNear:D.near,depthFar:D.far}),z=D.near,H=D.far),D.layers.mask=K.layers.mask|6,M.layers.mask=D.layers.mask&3,w.layers.mask=D.layers.mask&5;let Ue=K.parent,se=D.cameras;pe(D,Ue);for(let Re=0;Re<se.length;Re++)pe(se[Re],Ue);se.length===2?le(D,M,w):D.projectionMatrix.copy(M.projectionMatrix),Le(K,D,Ue)};function Le(K,Z,xe){xe===null?K.matrix.copy(Z.matrixWorld):(K.matrix.copy(xe.matrixWorld),K.matrix.invert(),K.matrix.multiply(Z.matrixWorld)),K.matrix.decompose(K.position,K.quaternion,K.scale),K.updateMatrixWorld(!0),K.projectionMatrix.copy(Z.projectionMatrix),K.projectionMatrixInverse.copy(Z.projectionMatrixInverse),K.isPerspectiveCamera&&(K.fov=Ys*2*Math.atan(1/K.projectionMatrix.elements[5]),K.zoom=1)}this.getCamera=function(){return D},this.getFoveation=function(){if(!(p===null&&g===null))return u},this.setFoveation=function(K){u=K,p!==null&&(p.fixedFoveation=K),g!==null&&g.fixedFoveation!==void 0&&(g.fixedFoveation=K)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(D)},this.getCameraTexture=function(K){return d[K]};let et=null;function st(K,Z){if(h=Z.getViewerPose(c||o),y=Z,h!==null){let xe=h.views;g!==null&&(e.setRenderTargetFramebuffer(x,g.framebuffer),e.setRenderTarget(x));let Ue=!1;xe.length!==D.cameras.length&&(D.cameras.length=0,Ue=!0);for(let R=0;R<xe.length;R++){let Ke=xe[R],Pe=null;if(g!==null)Pe=g.getViewport(Ke);else{let ye=f.getViewSubImage(p,Ke);Pe=ye.viewport,R===0&&(e.setRenderTargetTextures(x,ye.colorTexture,ye.depthStencilTexture),e.setRenderTarget(x))}let ke=I[R];ke===void 0&&(ke=new Pt,ke.layers.enable(R),ke.viewport=new gt,I[R]=ke),ke.matrix.fromArray(Ke.transform.matrix),ke.matrix.decompose(ke.position,ke.quaternion,ke.scale),ke.projectionMatrix.fromArray(Ke.projectionMatrix),ke.projectionMatrixInverse.copy(ke.projectionMatrix).invert(),ke.viewport.set(Pe.x,Pe.y,Pe.width,Pe.height),R===0&&(D.matrix.copy(ke.matrix),D.matrix.decompose(D.position,D.quaternion,D.scale)),Ue===!0&&D.cameras.push(ke)}let se=s.enabledFeatures;if(se&&se.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&v){f=i.getBinding();let R=f.getDepthInformation(xe[0]);R&&R.isValid&&R.texture&&m.init(R,s.renderState)}if(se&&se.includes("camera-access")&&v){e.state.unbindTexture(),f=i.getBinding();for(let R=0;R<xe.length;R++){let Ke=xe[R].camera;if(Ke){let Pe=d[Ke];Pe||(Pe=new Ha,d[Ke]=Pe);let ke=f.getCameraImage(Ke);Pe.sourceTexture=ke}}}}for(let xe=0;xe<A.length;xe++){let Ue=E[xe],se=A[xe];Ue!==null&&se!==void 0&&se.update(Ue,Z,c||o)}et&&et(K,Z),Z.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:Z}),y=null}let qe=new Zu;qe.setAnimationLoop(st),this.setAnimationLoop=function(K){et=K},this.dispose=function(){}}},bi=new ln,Ug=new ot;function Ng(a,e){function n(m,d){m.matrixAutoUpdate===!0&&m.updateMatrix(),d.value.copy(m.matrix)}function i(m,d){d.color.getRGB(m.fogColor.value,Al(a)),d.isFog?(m.fogNear.value=d.near,m.fogFar.value=d.far):d.isFogExp2&&(m.fogDensity.value=d.density)}function s(m,d,T,_,x){d.isMeshBasicMaterial||d.isMeshLambertMaterial?r(m,d):d.isMeshToonMaterial?(r(m,d),f(m,d)):d.isMeshPhongMaterial?(r(m,d),h(m,d)):d.isMeshStandardMaterial?(r(m,d),p(m,d),d.isMeshPhysicalMaterial&&g(m,d,x)):d.isMeshMatcapMaterial?(r(m,d),y(m,d)):d.isMeshDepthMaterial?r(m,d):d.isMeshDistanceMaterial?(r(m,d),v(m,d)):d.isMeshNormalMaterial?r(m,d):d.isLineBasicMaterial?(o(m,d),d.isLineDashedMaterial&&l(m,d)):d.isPointsMaterial?u(m,d,T,_):d.isSpriteMaterial?c(m,d):d.isShadowMaterial?(m.color.value.copy(d.color),m.opacity.value=d.opacity):d.isShaderMaterial&&(d.uniformsNeedUpdate=!1)}function r(m,d){m.opacity.value=d.opacity,d.color&&m.diffuse.value.copy(d.color),d.emissive&&m.emissive.value.copy(d.emissive).multiplyScalar(d.emissiveIntensity),d.map&&(m.map.value=d.map,n(d.map,m.mapTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,n(d.alphaMap,m.alphaMapTransform)),d.bumpMap&&(m.bumpMap.value=d.bumpMap,n(d.bumpMap,m.bumpMapTransform),m.bumpScale.value=d.bumpScale,d.side===Bt&&(m.bumpScale.value*=-1)),d.normalMap&&(m.normalMap.value=d.normalMap,n(d.normalMap,m.normalMapTransform),m.normalScale.value.copy(d.normalScale),d.side===Bt&&m.normalScale.value.negate()),d.displacementMap&&(m.displacementMap.value=d.displacementMap,n(d.displacementMap,m.displacementMapTransform),m.displacementScale.value=d.displacementScale,m.displacementBias.value=d.displacementBias),d.emissiveMap&&(m.emissiveMap.value=d.emissiveMap,n(d.emissiveMap,m.emissiveMapTransform)),d.specularMap&&(m.specularMap.value=d.specularMap,n(d.specularMap,m.specularMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest);let T=e.get(d),_=T.envMap,x=T.envMapRotation;_&&(m.envMap.value=_,bi.copy(x),bi.x*=-1,bi.y*=-1,bi.z*=-1,_.isCubeTexture&&_.isRenderTargetTexture===!1&&(bi.y*=-1,bi.z*=-1),m.envMapRotation.value.setFromMatrix4(Ug.makeRotationFromEuler(bi)),m.flipEnvMap.value=_.isCubeTexture&&_.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=d.reflectivity,m.ior.value=d.ior,m.refractionRatio.value=d.refractionRatio),d.lightMap&&(m.lightMap.value=d.lightMap,m.lightMapIntensity.value=d.lightMapIntensity,n(d.lightMap,m.lightMapTransform)),d.aoMap&&(m.aoMap.value=d.aoMap,m.aoMapIntensity.value=d.aoMapIntensity,n(d.aoMap,m.aoMapTransform))}function o(m,d){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,d.map&&(m.map.value=d.map,n(d.map,m.mapTransform))}function l(m,d){m.dashSize.value=d.dashSize,m.totalSize.value=d.dashSize+d.gapSize,m.scale.value=d.scale}function u(m,d,T,_){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,m.size.value=d.size*T,m.scale.value=_*.5,d.map&&(m.map.value=d.map,n(d.map,m.uvTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,n(d.alphaMap,m.alphaMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest)}function c(m,d){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,m.rotation.value=d.rotation,d.map&&(m.map.value=d.map,n(d.map,m.mapTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,n(d.alphaMap,m.alphaMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest)}function h(m,d){m.specular.value.copy(d.specular),m.shininess.value=Math.max(d.shininess,1e-4)}function f(m,d){d.gradientMap&&(m.gradientMap.value=d.gradientMap)}function p(m,d){m.metalness.value=d.metalness,d.metalnessMap&&(m.metalnessMap.value=d.metalnessMap,n(d.metalnessMap,m.metalnessMapTransform)),m.roughness.value=d.roughness,d.roughnessMap&&(m.roughnessMap.value=d.roughnessMap,n(d.roughnessMap,m.roughnessMapTransform)),d.envMap&&(m.envMapIntensity.value=d.envMapIntensity)}function g(m,d,T){m.ior.value=d.ior,d.sheen>0&&(m.sheenColor.value.copy(d.sheenColor).multiplyScalar(d.sheen),m.sheenRoughness.value=d.sheenRoughness,d.sheenColorMap&&(m.sheenColorMap.value=d.sheenColorMap,n(d.sheenColorMap,m.sheenColorMapTransform)),d.sheenRoughnessMap&&(m.sheenRoughnessMap.value=d.sheenRoughnessMap,n(d.sheenRoughnessMap,m.sheenRoughnessMapTransform))),d.clearcoat>0&&(m.clearcoat.value=d.clearcoat,m.clearcoatRoughness.value=d.clearcoatRoughness,d.clearcoatMap&&(m.clearcoatMap.value=d.clearcoatMap,n(d.clearcoatMap,m.clearcoatMapTransform)),d.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=d.clearcoatRoughnessMap,n(d.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),d.clearcoatNormalMap&&(m.clearcoatNormalMap.value=d.clearcoatNormalMap,n(d.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(d.clearcoatNormalScale),d.side===Bt&&m.clearcoatNormalScale.value.negate())),d.dispersion>0&&(m.dispersion.value=d.dispersion),d.iridescence>0&&(m.iridescence.value=d.iridescence,m.iridescenceIOR.value=d.iridescenceIOR,m.iridescenceThicknessMinimum.value=d.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=d.iridescenceThicknessRange[1],d.iridescenceMap&&(m.iridescenceMap.value=d.iridescenceMap,n(d.iridescenceMap,m.iridescenceMapTransform)),d.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=d.iridescenceThicknessMap,n(d.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),d.transmission>0&&(m.transmission.value=d.transmission,m.transmissionSamplerMap.value=T.texture,m.transmissionSamplerSize.value.set(T.width,T.height),d.transmissionMap&&(m.transmissionMap.value=d.transmissionMap,n(d.transmissionMap,m.transmissionMapTransform)),m.thickness.value=d.thickness,d.thicknessMap&&(m.thicknessMap.value=d.thicknessMap,n(d.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=d.attenuationDistance,m.attenuationColor.value.copy(d.attenuationColor)),d.anisotropy>0&&(m.anisotropyVector.value.set(d.anisotropy*Math.cos(d.anisotropyRotation),d.anisotropy*Math.sin(d.anisotropyRotation)),d.anisotropyMap&&(m.anisotropyMap.value=d.anisotropyMap,n(d.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=d.specularIntensity,m.specularColor.value.copy(d.specularColor),d.specularColorMap&&(m.specularColorMap.value=d.specularColorMap,n(d.specularColorMap,m.specularColorMapTransform)),d.specularIntensityMap&&(m.specularIntensityMap.value=d.specularIntensityMap,n(d.specularIntensityMap,m.specularIntensityMapTransform))}function y(m,d){d.matcap&&(m.matcap.value=d.matcap)}function v(m,d){let T=e.get(d).light;m.referencePosition.value.setFromMatrixPosition(T.matrixWorld),m.nearDistance.value=T.shadow.camera.near,m.farDistance.value=T.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:s}}function Fg(a,e,n,i){let s={},r={},o=[],l=a.getParameter(a.MAX_UNIFORM_BUFFER_BINDINGS);function u(T,_){let x=_.program;i.uniformBlockBinding(T,x)}function c(T,_){let x=s[T.id];x===void 0&&(y(T),x=h(T),s[T.id]=x,T.addEventListener("dispose",m));let A=_.program;i.updateUBOMapping(T,A);let E=e.render.frame;r[T.id]!==E&&(p(T),r[T.id]=E)}function h(T){let _=f();T.__bindingPointIndex=_;let x=a.createBuffer(),A=T.__size,E=T.usage;return a.bindBuffer(a.UNIFORM_BUFFER,x),a.bufferData(a.UNIFORM_BUFFER,A,E),a.bindBuffer(a.UNIFORM_BUFFER,null),a.bindBufferBase(a.UNIFORM_BUFFER,_,x),x}function f(){for(let T=0;T<l;T++)if(o.indexOf(T)===-1)return o.push(T),T;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function p(T){let _=s[T.id],x=T.uniforms,A=T.__cache;a.bindBuffer(a.UNIFORM_BUFFER,_);for(let E=0,C=x.length;E<C;E++){let P=Array.isArray(x[E])?x[E]:[x[E]];for(let M=0,w=P.length;M<w;M++){let I=P[M];if(g(I,E,M,A)===!0){let D=I.__offset,z=Array.isArray(I.value)?I.value:[I.value],H=0;for(let j=0;j<z.length;j++){let W=z[j],ne=v(W);typeof W=="number"||typeof W=="boolean"?(I.__data[0]=W,a.bufferSubData(a.UNIFORM_BUFFER,D+H,I.__data)):W.isMatrix3?(I.__data[0]=W.elements[0],I.__data[1]=W.elements[1],I.__data[2]=W.elements[2],I.__data[3]=0,I.__data[4]=W.elements[3],I.__data[5]=W.elements[4],I.__data[6]=W.elements[5],I.__data[7]=0,I.__data[8]=W.elements[6],I.__data[9]=W.elements[7],I.__data[10]=W.elements[8],I.__data[11]=0):(W.toArray(I.__data,H),H+=ne.storage/Float32Array.BYTES_PER_ELEMENT)}a.bufferSubData(a.UNIFORM_BUFFER,D,I.__data)}}}a.bindBuffer(a.UNIFORM_BUFFER,null)}function g(T,_,x,A){let E=T.value,C=_+"_"+x;if(A[C]===void 0)return typeof E=="number"||typeof E=="boolean"?A[C]=E:A[C]=E.clone(),!0;{let P=A[C];if(typeof E=="number"||typeof E=="boolean"){if(P!==E)return A[C]=E,!0}else if(P.equals(E)===!1)return P.copy(E),!0}return!1}function y(T){let _=T.uniforms,x=0,A=16;for(let C=0,P=_.length;C<P;C++){let M=Array.isArray(_[C])?_[C]:[_[C]];for(let w=0,I=M.length;w<I;w++){let D=M[w],z=Array.isArray(D.value)?D.value:[D.value];for(let H=0,j=z.length;H<j;H++){let W=z[H],ne=v(W),X=x%A,re=X%ne.boundary,le=X+re;x+=re,le!==0&&A-le<ne.storage&&(x+=A-le),D.__data=new Float32Array(ne.storage/Float32Array.BYTES_PER_ELEMENT),D.__offset=x,x+=ne.storage}}}let E=x%A;return E>0&&(x+=A-E),T.__size=x,T.__cache={},this}function v(T){let _={boundary:0,storage:0};return typeof T=="number"||typeof T=="boolean"?(_.boundary=4,_.storage=4):T.isVector2?(_.boundary=8,_.storage=8):T.isVector3||T.isColor?(_.boundary=16,_.storage=12):T.isVector4?(_.boundary=16,_.storage=16):T.isMatrix3?(_.boundary=48,_.storage=48):T.isMatrix4?(_.boundary=64,_.storage=64):T.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",T),_}function m(T){let _=T.target;_.removeEventListener("dispose",m);let x=o.indexOf(_.__bindingPointIndex);o.splice(x,1),a.deleteBuffer(s[_.id]),delete s[_.id],delete r[_.id]}function d(){for(let T in s)a.deleteBuffer(s[T]);o=[],s={},r={}}return{bind:u,update:c,dispose:d}}var po=class{constructor(e={}){let{canvas:n=Su(),context:i=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:l=!1,premultipliedAlpha:u=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:f=!1,reversedDepthBuffer:p=!1}=e;this.isWebGLRenderer=!0;let g;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");g=i.getContextAttributes().alpha}else g=o;let y=new Uint32Array(4),v=new Int32Array(4),m=null,d=null,T=[],_=[];this.domElement=n,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Ln,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let x=this,A=!1;this._outputColorSpace=Et;let E=0,C=0,P=null,M=-1,w=null,I=new gt,D=new gt,z=null,H=new Oe(0),j=0,W=n.width,ne=n.height,X=1,re=null,le=null,pe=new gt(0,0,W,ne),Le=new gt(0,0,W,ne),et=!1,st=new qn,qe=!1,K=!1,Z=new ot,xe=new U,Ue=new gt,se={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Re=!1;function ut(){return P===null?X:1}let R=i;function Ke(S,N){return n.getContext(S,N)}try{let S={alpha:!0,depth:s,stencil:r,antialias:l,premultipliedAlpha:u,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:f};if("setAttribute"in n&&n.setAttribute("data-engine",`three.js r${"180"}`),n.addEventListener("webglcontextlost",ce,!1),n.addEventListener("webglcontextrestored",_e,!1),n.addEventListener("webglcontextcreationerror",ee,!1),R===null){let N="webgl2";if(R=Ke(N,S),R===null)throw Ke(N)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(S){throw console.error("THREE.WebGLRenderer: "+S.message),S}let Pe,ke,ye,ft,Me,Ve,wt,_t,k,b,O,$,Q,Y,Ee,oe,Se,we,ie,fe,De,Te,he,He;function L(){Pe=new tm(R),Pe.init(),Te=new Ig(R,Pe),ke=new Yp(R,Pe,e,Te),ye=new Rg(R,Pe),ke.reversedDepthBuffer&&p&&ye.buffers.depth.setReversed(!0),ft=new am(R),Me=new yg,Ve=new Pg(R,Pe,ye,Me,ke,Te,ft),wt=new Kp(x),_t=new em(x),k=new cd(R),he=new qp(R,k),b=new nm(R,k,ft,he),O=new rm(R,b,k,ft),ie=new sm(R,ke,Ve),oe=new $p(Me),$=new gg(x,wt,_t,Pe,ke,he,oe),Q=new Ng(x,Me),Y=new _g,Ee=new Tg(Pe),we=new Xp(x,wt,_t,ye,O,g,u),Se=new kg(x,O,ke),He=new Fg(R,ft,ke,ye),fe=new jp(R,Pe,ft),De=new im(R,Pe,ft),ft.programs=$.programs,x.capabilities=ke,x.extensions=Pe,x.properties=Me,x.renderLists=Y,x.shadowMap=Se,x.state=ye,x.info=ft}L();let ae=new Wl(x,R);this.xr=ae,this.getContext=function(){return R},this.getContextAttributes=function(){return R.getContextAttributes()},this.forceContextLoss=function(){let S=Pe.get("WEBGL_lose_context");S&&S.loseContext()},this.forceContextRestore=function(){let S=Pe.get("WEBGL_lose_context");S&&S.restoreContext()},this.getPixelRatio=function(){return X},this.setPixelRatio=function(S){S!==void 0&&(X=S,this.setSize(W,ne,!1))},this.getSize=function(S){return S.set(W,ne)},this.setSize=function(S,N,V=!0){if(ae.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}W=S,ne=N,n.width=Math.floor(S*X),n.height=Math.floor(N*X),V===!0&&(n.style.width=S+"px",n.style.height=N+"px"),this.setViewport(0,0,S,N)},this.getDrawingBufferSize=function(S){return S.set(W*X,ne*X).floor()},this.setDrawingBufferSize=function(S,N,V){W=S,ne=N,X=V,n.width=Math.floor(S*V),n.height=Math.floor(N*V),this.setViewport(0,0,S,N)},this.getCurrentViewport=function(S){return S.copy(I)},this.getViewport=function(S){return S.copy(pe)},this.setViewport=function(S,N,V,G){S.isVector4?pe.set(S.x,S.y,S.z,S.w):pe.set(S,N,V,G),ye.viewport(I.copy(pe).multiplyScalar(X).round())},this.getScissor=function(S){return S.copy(Le)},this.setScissor=function(S,N,V,G){S.isVector4?Le.set(S.x,S.y,S.z,S.w):Le.set(S,N,V,G),ye.scissor(D.copy(Le).multiplyScalar(X).round())},this.getScissorTest=function(){return et},this.setScissorTest=function(S){ye.setScissorTest(et=S)},this.setOpaqueSort=function(S){re=S},this.setTransparentSort=function(S){le=S},this.getClearColor=function(S){return S.copy(we.getClearColor())},this.setClearColor=function(){we.setClearColor(...arguments)},this.getClearAlpha=function(){return we.getClearAlpha()},this.setClearAlpha=function(){we.setClearAlpha(...arguments)},this.clear=function(S=!0,N=!0,V=!0){let G=0;if(S){let F=!1;if(P!==null){let te=P.texture.format;F=te===Dr||te===Lr||te===Ir}if(F){let te=P.texture.type,de=te===un||te===Kn||te===ta||te===ia||te===Rr||te===Pr,be=we.getClearColor(),ge=we.getClearAlpha(),Ie=be.r,Ne=be.g,Ae=be.b;de?(y[0]=Ie,y[1]=Ne,y[2]=Ae,y[3]=ge,R.clearBufferuiv(R.COLOR,0,y)):(v[0]=Ie,v[1]=Ne,v[2]=Ae,v[3]=ge,R.clearBufferiv(R.COLOR,0,v))}else G|=R.COLOR_BUFFER_BIT}N&&(G|=R.DEPTH_BUFFER_BIT),V&&(G|=R.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),R.clear(G)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){n.removeEventListener("webglcontextlost",ce,!1),n.removeEventListener("webglcontextrestored",_e,!1),n.removeEventListener("webglcontextcreationerror",ee,!1),we.dispose(),Y.dispose(),Ee.dispose(),Me.dispose(),wt.dispose(),_t.dispose(),O.dispose(),he.dispose(),He.dispose(),$.dispose(),ae.dispose(),ae.removeEventListener("sessionstart",hn),ae.removeEventListener("sessionend",nc),ti.stop()};function ce(S){S.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),A=!0}function _e(){console.log("THREE.WebGLRenderer: Context Restored."),A=!1;let S=ft.autoReset,N=Se.enabled,V=Se.autoUpdate,G=Se.needsUpdate,F=Se.type;L(),ft.autoReset=S,Se.enabled=N,Se.autoUpdate=V,Se.needsUpdate=G,Se.type=F}function ee(S){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",S.statusMessage)}function J(S){let N=S.target;N.removeEventListener("dispose",J),ve(N)}function ve(S){Fe(S),Me.remove(S)}function Fe(S){let N=Me.get(S).programs;N!==void 0&&(N.forEach(function(V){$.releaseProgram(V)}),S.isShaderMaterial&&$.releaseShaderCache(S))}this.renderBufferDirect=function(S,N,V,G,F,te){N===null&&(N=se);let de=F.isMesh&&F.matrixWorld.determinant()<0,be=_h(S,N,V,G,F);ye.setMaterial(G,de);let ge=V.index,Ie=1;if(G.wireframe===!0){if(ge=b.getWireframeAttribute(V),ge===void 0)return;Ie=2}let Ne=V.drawRange,Ae=V.attributes.position,We=Ne.start*Ie,it=(Ne.start+Ne.count)*Ie;te!==null&&(We=Math.max(We,te.start*Ie),it=Math.min(it,(te.start+te.count)*Ie)),ge!==null?(We=Math.max(We,0),it=Math.min(it,ge.count)):Ae!=null&&(We=Math.max(We,0),it=Math.min(it,Ae.count));let xt=it-We;if(xt<0||xt===1/0)return;he.setup(F,G,be,V,ge);let ht,rt=fe;if(ge!==null&&(ht=k.get(ge),rt=De,rt.setIndex(ht)),F.isMesh)G.wireframe===!0?(ye.setLineWidth(G.wireframeLinewidth*ut()),rt.setMode(R.LINES)):rt.setMode(R.TRIANGLES);else if(F.isLine){let Ce=G.linewidth;Ce===void 0&&(Ce=1),ye.setLineWidth(Ce*ut()),F.isLineSegments?rt.setMode(R.LINES):F.isLineLoop?rt.setMode(R.LINE_LOOP):rt.setMode(R.LINE_STRIP)}else F.isPoints?rt.setMode(R.POINTS):F.isSprite&&rt.setMode(R.TRIANGLES);if(F.isBatchedMesh)if(F._multiDrawInstances!==null)qi("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),rt.renderMultiDrawInstances(F._multiDrawStarts,F._multiDrawCounts,F._multiDrawCount,F._multiDrawInstances);else if(Pe.get("WEBGL_multi_draw"))rt.renderMultiDraw(F._multiDrawStarts,F._multiDrawCounts,F._multiDrawCount);else{let Ce=F._multiDrawStarts,pt=F._multiDrawCounts,Je=F._multiDrawCount,Vt=ge?k.get(ge).bytesPerElement:1,Ei=Me.get(G).currentProgram.getUniforms();for(let Gt=0;Gt<Je;Gt++)Ei.setValue(R,"_gl_DrawID",Gt),rt.render(Ce[Gt]/Vt,pt[Gt])}else if(F.isInstancedMesh)rt.renderInstances(We,xt,F.count);else if(V.isInstancedBufferGeometry){let Ce=V._maxInstanceCount!==void 0?V._maxInstanceCount:1/0,pt=Math.min(V.instanceCount,Ce);rt.renderInstances(We,xt,pt)}else rt.render(We,xt)};function lt(S,N,V){S.transparent===!0&&S.side===Ht&&S.forceSinglePass===!1?(S.side=Bt,S.needsUpdate=!0,ds(S,N,V),S.side=Cn,S.needsUpdate=!0,ds(S,N,V),S.side=Ht):ds(S,N,V)}this.compile=function(S,N,V=null){V===null&&(V=S),d=Ee.get(V),d.init(N),_.push(d),V.traverseVisible(function(F){F.isLight&&F.layers.test(N.layers)&&(d.pushLight(F),F.castShadow&&d.pushShadow(F))}),S!==V&&S.traverseVisible(function(F){F.isLight&&F.layers.test(N.layers)&&(d.pushLight(F),F.castShadow&&d.pushShadow(F))}),d.setupLights();let G=new Set;return S.traverse(function(F){if(!(F.isMesh||F.isPoints||F.isLine||F.isSprite))return;let te=F.material;if(te)if(Array.isArray(te))for(let de=0;de<te.length;de++){let be=te[de];lt(be,V,F),G.add(be)}else lt(te,V,F),G.add(te)}),d=_.pop(),G},this.compileAsync=function(S,N,V=null){let G=this.compile(S,N,V);return new Promise(F=>{function te(){if(G.forEach(function(de){Me.get(de).currentProgram.isReady()&&G.delete(de)}),G.size===0){F(S);return}setTimeout(te,10)}Pe.get("KHR_parallel_shader_compile")!==null?te():setTimeout(te,10)})};let Qe=null;function Mn(S){Qe&&Qe(S)}function hn(){ti.stop()}function nc(){ti.start()}let ti=new Zu;ti.setAnimationLoop(Mn),typeof self<"u"&&ti.setContext(self),this.setAnimationLoop=function(S){Qe=S,ae.setAnimationLoop(S),S===null?ti.stop():ti.start()},ae.addEventListener("sessionstart",hn),ae.addEventListener("sessionend",nc),this.render=function(S,N){if(N!==void 0&&N.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(A===!0)return;if(S.matrixWorldAutoUpdate===!0&&S.updateMatrixWorld(),N.parent===null&&N.matrixWorldAutoUpdate===!0&&N.updateMatrixWorld(),ae.enabled===!0&&ae.isPresenting===!0&&(ae.cameraAutoUpdate===!0&&ae.updateCamera(N),N=ae.getCamera()),S.isScene===!0&&S.onBeforeRender(x,S,N,P),d=Ee.get(S,_.length),d.init(N),_.push(d),Z.multiplyMatrices(N.projectionMatrix,N.matrixWorldInverse),st.setFromProjectionMatrix(Z,rn,N.reversedDepth),K=this.localClippingEnabled,qe=oe.init(this.clippingPlanes,K),m=Y.get(S,T.length),m.init(),T.push(m),ae.enabled===!0&&ae.isPresenting===!0){let te=x.xr.getDepthSensingMesh();te!==null&&To(te,N,-1/0,x.sortObjects)}To(S,N,0,x.sortObjects),m.finish(),x.sortObjects===!0&&m.sort(re,le),Re=ae.enabled===!1||ae.isPresenting===!1||ae.hasDepthSensing()===!1,Re&&we.addToRenderList(m,S),this.info.render.frame++,qe===!0&&oe.beginShadows();let V=d.state.shadowsArray;Se.render(V,S,N),qe===!0&&oe.endShadows(),this.info.autoReset===!0&&this.info.reset();let G=m.opaque,F=m.transmissive;if(d.setupLights(),N.isArrayCamera){let te=N.cameras;if(F.length>0)for(let de=0,be=te.length;de<be;de++){let ge=te[de];ac(G,F,S,ge)}Re&&we.render(S);for(let de=0,be=te.length;de<be;de++){let ge=te[de];ic(m,S,ge,ge.viewport)}}else F.length>0&&ac(G,F,S,N),Re&&we.render(S),ic(m,S,N);P!==null&&C===0&&(Ve.updateMultisampleRenderTarget(P),Ve.updateRenderTargetMipmap(P)),S.isScene===!0&&S.onAfterRender(x,S,N),he.resetDefaultState(),M=-1,w=null,_.pop(),_.length>0?(d=_[_.length-1],qe===!0&&oe.setGlobalState(x.clippingPlanes,d.state.camera)):d=null,T.pop(),T.length>0?m=T[T.length-1]:m=null};function To(S,N,V,G){if(S.visible===!1)return;if(S.layers.test(N.layers)){if(S.isGroup)V=S.renderOrder;else if(S.isLOD)S.autoUpdate===!0&&S.update(N);else if(S.isLight)d.pushLight(S),S.castShadow&&d.pushShadow(S);else if(S.isSprite){if(!S.frustumCulled||st.intersectsSprite(S)){G&&Ue.setFromMatrixPosition(S.matrixWorld).applyMatrix4(Z);let de=O.update(S),be=S.material;be.visible&&m.push(S,de,be,V,Ue.z,null)}}else if((S.isMesh||S.isLine||S.isPoints)&&(!S.frustumCulled||st.intersectsObject(S))){let de=O.update(S),be=S.material;if(G&&(S.boundingSphere!==void 0?(S.boundingSphere===null&&S.computeBoundingSphere(),Ue.copy(S.boundingSphere.center)):(de.boundingSphere===null&&de.computeBoundingSphere(),Ue.copy(de.boundingSphere.center)),Ue.applyMatrix4(S.matrixWorld).applyMatrix4(Z)),Array.isArray(be)){let ge=de.groups;for(let Ie=0,Ne=ge.length;Ie<Ne;Ie++){let Ae=ge[Ie],We=be[Ae.materialIndex];We&&We.visible&&m.push(S,de,We,V,Ue.z,Ae)}}else be.visible&&m.push(S,de,be,V,Ue.z,null)}}let te=S.children;for(let de=0,be=te.length;de<be;de++)To(te[de],N,V,G)}function ic(S,N,V,G){let F=S.opaque,te=S.transmissive,de=S.transparent;d.setupLightsView(V),qe===!0&&oe.setGlobalState(x.clippingPlanes,V),G&&ye.viewport(I.copy(G)),F.length>0&&hs(F,N,V),te.length>0&&hs(te,N,V),de.length>0&&hs(de,N,V),ye.buffers.depth.setTest(!0),ye.buffers.depth.setMask(!0),ye.buffers.color.setMask(!0),ye.setPolygonOffset(!1)}function ac(S,N,V,G){if((V.isScene===!0?V.overrideMaterial:null)!==null)return;d.state.transmissionRenderTarget[G.id]===void 0&&(d.state.transmissionRenderTarget[G.id]=new mn(1,1,{generateMipmaps:!0,type:Pe.has("EXT_color_buffer_half_float")||Pe.has("EXT_color_buffer_float")?na:un,minFilter:$n,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Ye.workingColorSpace}));let te=d.state.transmissionRenderTarget[G.id],de=G.viewport||I;te.setSize(de.z*x.transmissionResolutionScale,de.w*x.transmissionResolutionScale);let be=x.getRenderTarget(),ge=x.getActiveCubeFace(),Ie=x.getActiveMipmapLevel();x.setRenderTarget(te),x.getClearColor(H),j=x.getClearAlpha(),j<1&&x.setClearColor(16777215,.5),x.clear(),Re&&we.render(V);let Ne=x.toneMapping;x.toneMapping=Ln;let Ae=G.viewport;if(G.viewport!==void 0&&(G.viewport=void 0),d.setupLightsView(G),qe===!0&&oe.setGlobalState(x.clippingPlanes,G),hs(S,V,G),Ve.updateMultisampleRenderTarget(te),Ve.updateRenderTargetMipmap(te),Pe.has("WEBGL_multisampled_render_to_texture")===!1){let We=!1;for(let it=0,xt=N.length;it<xt;it++){let ht=N[it],rt=ht.object,Ce=ht.geometry,pt=ht.material,Je=ht.group;if(pt.side===Ht&&rt.layers.test(G.layers)){let Vt=pt.side;pt.side=Bt,pt.needsUpdate=!0,sc(rt,V,G,Ce,pt,Je),pt.side=Vt,pt.needsUpdate=!0,We=!0}}We===!0&&(Ve.updateMultisampleRenderTarget(te),Ve.updateRenderTargetMipmap(te))}x.setRenderTarget(be,ge,Ie),x.setClearColor(H,j),Ae!==void 0&&(G.viewport=Ae),x.toneMapping=Ne}function hs(S,N,V){let G=N.isScene===!0?N.overrideMaterial:null;for(let F=0,te=S.length;F<te;F++){let de=S[F],be=de.object,ge=de.geometry,Ie=de.group,Ne=de.material;Ne.allowOverride===!0&&G!==null&&(Ne=G),be.layers.test(V.layers)&&sc(be,N,V,ge,Ne,Ie)}}function sc(S,N,V,G,F,te){S.onBeforeRender(x,N,V,G,F,te),S.modelViewMatrix.multiplyMatrices(V.matrixWorldInverse,S.matrixWorld),S.normalMatrix.getNormalMatrix(S.modelViewMatrix),F.onBeforeRender(x,N,V,G,S,te),F.transparent===!0&&F.side===Ht&&F.forceSinglePass===!1?(F.side=Bt,F.needsUpdate=!0,x.renderBufferDirect(V,N,G,F,S,te),F.side=Cn,F.needsUpdate=!0,x.renderBufferDirect(V,N,G,F,S,te),F.side=Ht):x.renderBufferDirect(V,N,G,F,S,te),S.onAfterRender(x,N,V,G,F,te)}function ds(S,N,V){N.isScene!==!0&&(N=se);let G=Me.get(S),F=d.state.lights,te=d.state.shadowsArray,de=F.state.version,be=$.getParameters(S,F.state,te,N,V),ge=$.getProgramCacheKey(be),Ie=G.programs;G.environment=S.isMeshStandardMaterial?N.environment:null,G.fog=N.fog,G.envMap=(S.isMeshStandardMaterial?_t:wt).get(S.envMap||G.environment),G.envMapRotation=G.environment!==null&&S.envMap===null?N.environmentRotation:S.envMapRotation,Ie===void 0&&(S.addEventListener("dispose",J),Ie=new Map,G.programs=Ie);let Ne=Ie.get(ge);if(Ne!==void 0){if(G.currentProgram===Ne&&G.lightsStateVersion===de)return oc(S,be),Ne}else be.uniforms=$.getUniforms(S),S.onBeforeCompile(be,x),Ne=$.acquireProgram(be,ge),Ie.set(ge,Ne),G.uniforms=be.uniforms;let Ae=G.uniforms;return(!S.isShaderMaterial&&!S.isRawShaderMaterial||S.clipping===!0)&&(Ae.clippingPlanes=oe.uniform),oc(S,be),G.needsLights=vh(S),G.lightsStateVersion=de,G.needsLights&&(Ae.ambientLightColor.value=F.state.ambient,Ae.lightProbe.value=F.state.probe,Ae.directionalLights.value=F.state.directional,Ae.directionalLightShadows.value=F.state.directionalShadow,Ae.spotLights.value=F.state.spot,Ae.spotLightShadows.value=F.state.spotShadow,Ae.rectAreaLights.value=F.state.rectArea,Ae.ltc_1.value=F.state.rectAreaLTC1,Ae.ltc_2.value=F.state.rectAreaLTC2,Ae.pointLights.value=F.state.point,Ae.pointLightShadows.value=F.state.pointShadow,Ae.hemisphereLights.value=F.state.hemi,Ae.directionalShadowMap.value=F.state.directionalShadowMap,Ae.directionalShadowMatrix.value=F.state.directionalShadowMatrix,Ae.spotShadowMap.value=F.state.spotShadowMap,Ae.spotLightMatrix.value=F.state.spotLightMatrix,Ae.spotLightMap.value=F.state.spotLightMap,Ae.pointShadowMap.value=F.state.pointShadowMap,Ae.pointShadowMatrix.value=F.state.pointShadowMatrix),G.currentProgram=Ne,G.uniformsList=null,Ne}function rc(S){if(S.uniformsList===null){let N=S.currentProgram.getUniforms();S.uniformsList=oa.seqWithValue(N.seq,S.uniforms)}return S.uniformsList}function oc(S,N){let V=Me.get(S);V.outputColorSpace=N.outputColorSpace,V.batching=N.batching,V.batchingColor=N.batchingColor,V.instancing=N.instancing,V.instancingColor=N.instancingColor,V.instancingMorph=N.instancingMorph,V.skinning=N.skinning,V.morphTargets=N.morphTargets,V.morphNormals=N.morphNormals,V.morphColors=N.morphColors,V.morphTargetsCount=N.morphTargetsCount,V.numClippingPlanes=N.numClippingPlanes,V.numIntersection=N.numClipIntersection,V.vertexAlphas=N.vertexAlphas,V.vertexTangents=N.vertexTangents,V.toneMapping=N.toneMapping}function _h(S,N,V,G,F){N.isScene!==!0&&(N=se),Ve.resetTextureUnits();let te=N.fog,de=G.isMeshStandardMaterial?N.environment:null,be=P===null?x.outputColorSpace:P.isXRRenderTarget===!0?P.texture.colorSpace:ui,ge=(G.isMeshStandardMaterial?_t:wt).get(G.envMap||de),Ie=G.vertexColors===!0&&!!V.attributes.color&&V.attributes.color.itemSize===4,Ne=!!V.attributes.tangent&&(!!G.normalMap||G.anisotropy>0),Ae=!!V.morphAttributes.position,We=!!V.morphAttributes.normal,it=!!V.morphAttributes.color,xt=Ln;G.toneMapped&&(P===null||P.isXRRenderTarget===!0)&&(xt=x.toneMapping);let ht=V.morphAttributes.position||V.morphAttributes.normal||V.morphAttributes.color,rt=ht!==void 0?ht.length:0,Ce=Me.get(G),pt=d.state.lights;if(qe===!0&&(K===!0||S!==w)){let Ut=S===w&&G.id===M;oe.setState(G,S,Ut)}let Je=!1;G.version===Ce.__version?(Ce.needsLights&&Ce.lightsStateVersion!==pt.state.version||Ce.outputColorSpace!==be||F.isBatchedMesh&&Ce.batching===!1||!F.isBatchedMesh&&Ce.batching===!0||F.isBatchedMesh&&Ce.batchingColor===!0&&F.colorTexture===null||F.isBatchedMesh&&Ce.batchingColor===!1&&F.colorTexture!==null||F.isInstancedMesh&&Ce.instancing===!1||!F.isInstancedMesh&&Ce.instancing===!0||F.isSkinnedMesh&&Ce.skinning===!1||!F.isSkinnedMesh&&Ce.skinning===!0||F.isInstancedMesh&&Ce.instancingColor===!0&&F.instanceColor===null||F.isInstancedMesh&&Ce.instancingColor===!1&&F.instanceColor!==null||F.isInstancedMesh&&Ce.instancingMorph===!0&&F.morphTexture===null||F.isInstancedMesh&&Ce.instancingMorph===!1&&F.morphTexture!==null||Ce.envMap!==ge||G.fog===!0&&Ce.fog!==te||Ce.numClippingPlanes!==void 0&&(Ce.numClippingPlanes!==oe.numPlanes||Ce.numIntersection!==oe.numIntersection)||Ce.vertexAlphas!==Ie||Ce.vertexTangents!==Ne||Ce.morphTargets!==Ae||Ce.morphNormals!==We||Ce.morphColors!==it||Ce.toneMapping!==xt||Ce.morphTargetsCount!==rt)&&(Je=!0):(Je=!0,Ce.__version=G.version);let Vt=Ce.currentProgram;Je===!0&&(Vt=ds(G,N,F));let Ei=!1,Gt=!1,xa=!1,mt=Vt.getUniforms(),$t=Ce.uniforms;if(ye.useProgram(Vt.program)&&(Ei=!0,Gt=!0,xa=!0),G.id!==M&&(M=G.id,Gt=!0),Ei||w!==S){ye.buffers.depth.getReversed()&&S.reversedDepth!==!0&&(S._reversedDepth=!0,S.updateProjectionMatrix()),mt.setValue(R,"projectionMatrix",S.projectionMatrix),mt.setValue(R,"viewMatrix",S.matrixWorldInverse);let Ot=mt.map.cameraPosition;Ot!==void 0&&Ot.setValue(R,xe.setFromMatrixPosition(S.matrixWorld)),ke.logarithmicDepthBuffer&&mt.setValue(R,"logDepthBufFC",2/(Math.log(S.far+1)/Math.LN2)),(G.isMeshPhongMaterial||G.isMeshToonMaterial||G.isMeshLambertMaterial||G.isMeshBasicMaterial||G.isMeshStandardMaterial||G.isShaderMaterial)&&mt.setValue(R,"isOrthographic",S.isOrthographicCamera===!0),w!==S&&(w=S,Gt=!0,xa=!0)}if(F.isSkinnedMesh){mt.setOptional(R,F,"bindMatrix"),mt.setOptional(R,F,"bindMatrixInverse");let Ut=F.skeleton;Ut&&(Ut.boneTexture===null&&Ut.computeBoneTexture(),mt.setValue(R,"boneTexture",Ut.boneTexture,Ve))}F.isBatchedMesh&&(mt.setOptional(R,F,"batchingTexture"),mt.setValue(R,"batchingTexture",F._matricesTexture,Ve),mt.setOptional(R,F,"batchingIdTexture"),mt.setValue(R,"batchingIdTexture",F._indirectTexture,Ve),mt.setOptional(R,F,"batchingColorTexture"),F._colorsTexture!==null&&mt.setValue(R,"batchingColorTexture",F._colorsTexture,Ve));let Kt=V.morphAttributes;if((Kt.position!==void 0||Kt.normal!==void 0||Kt.color!==void 0)&&ie.update(F,V,Vt),(Gt||Ce.receiveShadow!==F.receiveShadow)&&(Ce.receiveShadow=F.receiveShadow,mt.setValue(R,"receiveShadow",F.receiveShadow)),G.isMeshGouraudMaterial&&G.envMap!==null&&($t.envMap.value=ge,$t.flipEnvMap.value=ge.isCubeTexture&&ge.isRenderTargetTexture===!1?-1:1),G.isMeshStandardMaterial&&G.envMap===null&&N.environment!==null&&($t.envMapIntensity.value=N.environmentIntensity),Gt&&(mt.setValue(R,"toneMappingExposure",x.toneMappingExposure),Ce.needsLights&&bh($t,xa),te&&G.fog===!0&&Q.refreshFogUniforms($t,te),Q.refreshMaterialUniforms($t,G,X,ne,d.state.transmissionRenderTarget[S.id]),oa.upload(R,rc(Ce),$t,Ve)),G.isShaderMaterial&&G.uniformsNeedUpdate===!0&&(oa.upload(R,rc(Ce),$t,Ve),G.uniformsNeedUpdate=!1),G.isSpriteMaterial&&mt.setValue(R,"center",F.center),mt.setValue(R,"modelViewMatrix",F.modelViewMatrix),mt.setValue(R,"normalMatrix",F.normalMatrix),mt.setValue(R,"modelMatrix",F.matrixWorld),G.isShaderMaterial||G.isRawShaderMaterial){let Ut=G.uniformsGroups;for(let Ot=0,Eo=Ut.length;Ot<Eo;Ot++){let ni=Ut[Ot];He.update(ni,Vt),He.bind(ni,Vt)}}return Vt}function bh(S,N){S.ambientLightColor.needsUpdate=N,S.lightProbe.needsUpdate=N,S.directionalLights.needsUpdate=N,S.directionalLightShadows.needsUpdate=N,S.pointLights.needsUpdate=N,S.pointLightShadows.needsUpdate=N,S.spotLights.needsUpdate=N,S.spotLightShadows.needsUpdate=N,S.rectAreaLights.needsUpdate=N,S.hemisphereLights.needsUpdate=N}function vh(S){return S.isMeshLambertMaterial||S.isMeshToonMaterial||S.isMeshPhongMaterial||S.isMeshStandardMaterial||S.isShadowMaterial||S.isShaderMaterial&&S.lights===!0}this.getActiveCubeFace=function(){return E},this.getActiveMipmapLevel=function(){return C},this.getRenderTarget=function(){return P},this.setRenderTargetTextures=function(S,N,V){let G=Me.get(S);G.__autoAllocateDepthBuffer=S.resolveDepthBuffer===!1,G.__autoAllocateDepthBuffer===!1&&(G.__useRenderToTexture=!1),Me.get(S.texture).__webglTexture=N,Me.get(S.depthTexture).__webglTexture=G.__autoAllocateDepthBuffer?void 0:V,G.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(S,N){let V=Me.get(S);V.__webglFramebuffer=N,V.__useDefaultFramebuffer=N===void 0};let Mh=R.createFramebuffer();this.setRenderTarget=function(S,N=0,V=0){P=S,E=N,C=V;let G=!0,F=null,te=!1,de=!1;if(S){let ge=Me.get(S);if(ge.__useDefaultFramebuffer!==void 0)ye.bindFramebuffer(R.FRAMEBUFFER,null),G=!1;else if(ge.__webglFramebuffer===void 0)Ve.setupRenderTarget(S);else if(ge.__hasExternalTextures)Ve.rebindTextures(S,Me.get(S.texture).__webglTexture,Me.get(S.depthTexture).__webglTexture);else if(S.depthBuffer){let Ae=S.depthTexture;if(ge.__boundDepthTexture!==Ae){if(Ae!==null&&Me.has(Ae)&&(S.width!==Ae.image.width||S.height!==Ae.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");Ve.setupDepthRenderbuffer(S)}}let Ie=S.texture;(Ie.isData3DTexture||Ie.isDataArrayTexture||Ie.isCompressedArrayTexture)&&(de=!0);let Ne=Me.get(S).__webglFramebuffer;S.isWebGLCubeRenderTarget?(Array.isArray(Ne[N])?F=Ne[N][V]:F=Ne[N],te=!0):S.samples>0&&Ve.useMultisampledRTT(S)===!1?F=Me.get(S).__webglMultisampledFramebuffer:Array.isArray(Ne)?F=Ne[V]:F=Ne,I.copy(S.viewport),D.copy(S.scissor),z=S.scissorTest}else I.copy(pe).multiplyScalar(X).floor(),D.copy(Le).multiplyScalar(X).floor(),z=et;if(V!==0&&(F=Mh),ye.bindFramebuffer(R.FRAMEBUFFER,F)&&G&&ye.drawBuffers(S,F),ye.viewport(I),ye.scissor(D),ye.setScissorTest(z),te){let ge=Me.get(S.texture);R.framebufferTexture2D(R.FRAMEBUFFER,R.COLOR_ATTACHMENT0,R.TEXTURE_CUBE_MAP_POSITIVE_X+N,ge.__webglTexture,V)}else if(de){let ge=N;for(let Ie=0;Ie<S.textures.length;Ie++){let Ne=Me.get(S.textures[Ie]);R.framebufferTextureLayer(R.FRAMEBUFFER,R.COLOR_ATTACHMENT0+Ie,Ne.__webglTexture,V,ge)}}else if(S!==null&&V!==0){let ge=Me.get(S.texture);R.framebufferTexture2D(R.FRAMEBUFFER,R.COLOR_ATTACHMENT0,R.TEXTURE_2D,ge.__webglTexture,V)}M=-1},this.readRenderTargetPixels=function(S,N,V,G,F,te,de,be=0){if(!(S&&S.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let ge=Me.get(S).__webglFramebuffer;if(S.isWebGLCubeRenderTarget&&de!==void 0&&(ge=ge[de]),ge){ye.bindFramebuffer(R.FRAMEBUFFER,ge);try{let Ie=S.textures[be],Ne=Ie.format,Ae=Ie.type;if(!ke.textureFormatReadable(Ne)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!ke.textureTypeReadable(Ae)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}N>=0&&N<=S.width-G&&V>=0&&V<=S.height-F&&(S.textures.length>1&&R.readBuffer(R.COLOR_ATTACHMENT0+be),R.readPixels(N,V,G,F,Te.convert(Ne),Te.convert(Ae),te))}finally{let Ie=P!==null?Me.get(P).__webglFramebuffer:null;ye.bindFramebuffer(R.FRAMEBUFFER,Ie)}}},this.readRenderTargetPixelsAsync=async function(S,N,V,G,F,te,de,be=0){if(!(S&&S.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let ge=Me.get(S).__webglFramebuffer;if(S.isWebGLCubeRenderTarget&&de!==void 0&&(ge=ge[de]),ge)if(N>=0&&N<=S.width-G&&V>=0&&V<=S.height-F){ye.bindFramebuffer(R.FRAMEBUFFER,ge);let Ie=S.textures[be],Ne=Ie.format,Ae=Ie.type;if(!ke.textureFormatReadable(Ne))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!ke.textureTypeReadable(Ae))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let We=R.createBuffer();R.bindBuffer(R.PIXEL_PACK_BUFFER,We),R.bufferData(R.PIXEL_PACK_BUFFER,te.byteLength,R.STREAM_READ),S.textures.length>1&&R.readBuffer(R.COLOR_ATTACHMENT0+be),R.readPixels(N,V,G,F,Te.convert(Ne),Te.convert(Ae),0);let it=P!==null?Me.get(P).__webglFramebuffer:null;ye.bindFramebuffer(R.FRAMEBUFFER,it);let xt=R.fenceSync(R.SYNC_GPU_COMMANDS_COMPLETE,0);return R.flush(),await wu(R,xt,4),R.bindBuffer(R.PIXEL_PACK_BUFFER,We),R.getBufferSubData(R.PIXEL_PACK_BUFFER,0,te),R.deleteBuffer(We),R.deleteSync(xt),te}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(S,N=null,V=0){let G=Math.pow(2,-V),F=Math.floor(S.image.width*G),te=Math.floor(S.image.height*G),de=N!==null?N.x:0,be=N!==null?N.y:0;Ve.setTexture2D(S,0),R.copyTexSubImage2D(R.TEXTURE_2D,V,0,0,de,be,F,te),ye.unbindTexture()};let Sh=R.createFramebuffer(),wh=R.createFramebuffer();this.copyTextureToTexture=function(S,N,V=null,G=null,F=0,te=null){te===null&&(F!==0?(qi("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),te=F,F=0):te=0);let de,be,ge,Ie,Ne,Ae,We,it,xt,ht=S.isCompressedTexture?S.mipmaps[te]:S.image;if(V!==null)de=V.max.x-V.min.x,be=V.max.y-V.min.y,ge=V.isBox3?V.max.z-V.min.z:1,Ie=V.min.x,Ne=V.min.y,Ae=V.isBox3?V.min.z:0;else{let Kt=Math.pow(2,-F);de=Math.floor(ht.width*Kt),be=Math.floor(ht.height*Kt),S.isDataArrayTexture?ge=ht.depth:S.isData3DTexture?ge=Math.floor(ht.depth*Kt):ge=1,Ie=0,Ne=0,Ae=0}G!==null?(We=G.x,it=G.y,xt=G.z):(We=0,it=0,xt=0);let rt=Te.convert(N.format),Ce=Te.convert(N.type),pt;N.isData3DTexture?(Ve.setTexture3D(N,0),pt=R.TEXTURE_3D):N.isDataArrayTexture||N.isCompressedArrayTexture?(Ve.setTexture2DArray(N,0),pt=R.TEXTURE_2D_ARRAY):(Ve.setTexture2D(N,0),pt=R.TEXTURE_2D),R.pixelStorei(R.UNPACK_FLIP_Y_WEBGL,N.flipY),R.pixelStorei(R.UNPACK_PREMULTIPLY_ALPHA_WEBGL,N.premultiplyAlpha),R.pixelStorei(R.UNPACK_ALIGNMENT,N.unpackAlignment);let Je=R.getParameter(R.UNPACK_ROW_LENGTH),Vt=R.getParameter(R.UNPACK_IMAGE_HEIGHT),Ei=R.getParameter(R.UNPACK_SKIP_PIXELS),Gt=R.getParameter(R.UNPACK_SKIP_ROWS),xa=R.getParameter(R.UNPACK_SKIP_IMAGES);R.pixelStorei(R.UNPACK_ROW_LENGTH,ht.width),R.pixelStorei(R.UNPACK_IMAGE_HEIGHT,ht.height),R.pixelStorei(R.UNPACK_SKIP_PIXELS,Ie),R.pixelStorei(R.UNPACK_SKIP_ROWS,Ne),R.pixelStorei(R.UNPACK_SKIP_IMAGES,Ae);let mt=S.isDataArrayTexture||S.isData3DTexture,$t=N.isDataArrayTexture||N.isData3DTexture;if(S.isDepthTexture){let Kt=Me.get(S),Ut=Me.get(N),Ot=Me.get(Kt.__renderTarget),Eo=Me.get(Ut.__renderTarget);ye.bindFramebuffer(R.READ_FRAMEBUFFER,Ot.__webglFramebuffer),ye.bindFramebuffer(R.DRAW_FRAMEBUFFER,Eo.__webglFramebuffer);for(let ni=0;ni<ge;ni++)mt&&(R.framebufferTextureLayer(R.READ_FRAMEBUFFER,R.COLOR_ATTACHMENT0,Me.get(S).__webglTexture,F,Ae+ni),R.framebufferTextureLayer(R.DRAW_FRAMEBUFFER,R.COLOR_ATTACHMENT0,Me.get(N).__webglTexture,te,xt+ni)),R.blitFramebuffer(Ie,Ne,de,be,We,it,de,be,R.DEPTH_BUFFER_BIT,R.NEAREST);ye.bindFramebuffer(R.READ_FRAMEBUFFER,null),ye.bindFramebuffer(R.DRAW_FRAMEBUFFER,null)}else if(F!==0||S.isRenderTargetTexture||Me.has(S)){let Kt=Me.get(S),Ut=Me.get(N);ye.bindFramebuffer(R.READ_FRAMEBUFFER,Sh),ye.bindFramebuffer(R.DRAW_FRAMEBUFFER,wh);for(let Ot=0;Ot<ge;Ot++)mt?R.framebufferTextureLayer(R.READ_FRAMEBUFFER,R.COLOR_ATTACHMENT0,Kt.__webglTexture,F,Ae+Ot):R.framebufferTexture2D(R.READ_FRAMEBUFFER,R.COLOR_ATTACHMENT0,R.TEXTURE_2D,Kt.__webglTexture,F),$t?R.framebufferTextureLayer(R.DRAW_FRAMEBUFFER,R.COLOR_ATTACHMENT0,Ut.__webglTexture,te,xt+Ot):R.framebufferTexture2D(R.DRAW_FRAMEBUFFER,R.COLOR_ATTACHMENT0,R.TEXTURE_2D,Ut.__webglTexture,te),F!==0?R.blitFramebuffer(Ie,Ne,de,be,We,it,de,be,R.COLOR_BUFFER_BIT,R.NEAREST):$t?R.copyTexSubImage3D(pt,te,We,it,xt+Ot,Ie,Ne,de,be):R.copyTexSubImage2D(pt,te,We,it,Ie,Ne,de,be);ye.bindFramebuffer(R.READ_FRAMEBUFFER,null),ye.bindFramebuffer(R.DRAW_FRAMEBUFFER,null)}else $t?S.isDataTexture||S.isData3DTexture?R.texSubImage3D(pt,te,We,it,xt,de,be,ge,rt,Ce,ht.data):N.isCompressedArrayTexture?R.compressedTexSubImage3D(pt,te,We,it,xt,de,be,ge,rt,ht.data):R.texSubImage3D(pt,te,We,it,xt,de,be,ge,rt,Ce,ht):S.isDataTexture?R.texSubImage2D(R.TEXTURE_2D,te,We,it,de,be,rt,Ce,ht.data):S.isCompressedTexture?R.compressedTexSubImage2D(R.TEXTURE_2D,te,We,it,ht.width,ht.height,rt,ht.data):R.texSubImage2D(R.TEXTURE_2D,te,We,it,de,be,rt,Ce,ht);R.pixelStorei(R.UNPACK_ROW_LENGTH,Je),R.pixelStorei(R.UNPACK_IMAGE_HEIGHT,Vt),R.pixelStorei(R.UNPACK_SKIP_PIXELS,Ei),R.pixelStorei(R.UNPACK_SKIP_ROWS,Gt),R.pixelStorei(R.UNPACK_SKIP_IMAGES,xa),te===0&&N.generateMipmaps&&R.generateMipmap(pt),ye.unbindTexture()},this.initRenderTarget=function(S){Me.get(S).__webglFramebuffer===void 0&&Ve.setupRenderTarget(S)},this.initTexture=function(S){S.isCubeTexture?Ve.setTextureCube(S,0):S.isData3DTexture?Ve.setTexture3D(S,0):S.isDataArrayTexture||S.isCompressedArrayTexture?Ve.setTexture2DArray(S,0):Ve.setTexture2D(S,0),ye.unbindTexture()},this.resetState=function(){E=0,C=0,P=null,ye.reset(),he.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return rn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let n=this.getContext();n.drawingBufferColorSpace=Ye._getDrawingBufferColorSpace(e),n.unpackColorSpace=Ye._getUnpackColorSpace()}};var go=class{constructor(e){if(this.domElement=e,this.ctx=e.getContext("2d",{alpha:!1}),!this.ctx)throw Error("Kanvas 2D tidak tersedia");this.shadowMap={enabled:!1},this.ratio=1,this.cache=new WeakMap,this.frames=0,this.isSoftware=!0}setPixelRatio(){this.ratio=1}setSize(e,n){let i=Math.min(1,850/e);this.width=Math.round(e*i),this.height=Math.round(n*i),this.domElement.width=this.width,this.domElement.height=this.height,this.image=this.ctx.createImageData(this.width,this.height),this.depth=new Float32Array(this.width*this.height)}render(e,n){if(++this.frames%2===0)return;e.updateMatrixWorld(),n.updateMatrixWorld();let i=this.ctx,s=this.width,r=this.height,o=e.background||new Oe("#bedfdc");i.fillStyle="#"+o.getHexString(),i.fillRect(0,0,s,r);let l=i.createLinearGradient(0,r*.15,0,r);l.addColorStop(0,"#ffffff00"),l.addColorStop(1,"#e0e7c965"),i.fillStyle=l,i.fillRect(0,0,s,r);let u=new ot().multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),c=new qn().setFromProjectionMatrix(u),h=[],f=[],p=130;e.traverseVisible(m=>{if(m.isSprite){let D=new U().setFromMatrixPosition(m.matrixWorld),z=D.clone().project(n),H=D.distanceTo(n.position);z.z<1&&z.z>-1&&m.material.map?.image&&f.push({image:m.material.map.image,x:(z.x*.5+.5)*s,y:(-.5*z.y+.5)*r,size:m.scale.x*r/(2*Math.tan(n.fov*Math.PI/360)*H),aspect:m.scale.y/m.scale.x,depth:H});return}if(!m.isMesh||!m.geometry?.attributes.position||!c.intersectsObject(m))return;let d=Array.isArray(m.material)?m.material[0]:m.material;if(!d||d.opacity===0)return;let T=m.geometry,_=T.attributes.position,x=T.index?.array,A=T.attributes.normal,E=this.cache.get(T);E||(E={projected:new Float32Array(_.count*3),ws:new Float32Array(_.count)},this.cache.set(T,E));let C=E.projected,P=new ot().multiplyMatrices(u,m.matrixWorld),M=P.elements;for(let D=0;D<_.count;D++){let z=_.getX(D),H=_.getY(D),j=_.getZ(D),W=M[3]*z+M[7]*H+M[11]*j+M[15];E.ws[D]=W,C[D*3]=(M[0]*z+M[4]*H+M[8]*j+M[12])/W,C[D*3+1]=(M[1]*z+M[5]*H+M[9]*j+M[13])/W,C[D*3+2]=(M[2]*z+M[6]*H+M[10]*j+M[14])/W}if(d.map?.image){let D=new U().setFromMatrixPosition(m.matrixWorld),z=D.clone().project(n),H=D.distanceTo(n.position);if(z.z<1&&z.z>-1){let j=T.parameters;f.push({image:d.map.image,x:(z.x*.5+.5)*s,y:(-.5*z.y+.5)*r,size:(j.width||2)*r/(2*Math.tan(n.fov*Math.PI/360)*H),aspect:(j.height||.5)/(j.width||2),depth:H})}return}let w=x?x.length:_.count,I=d.color||new Oe("#a5b68b");for(let D=0;D<w;D+=3){let z=x?x[D]:D,H=x?x[D+1]:D+1,j=x?x[D+2]:D+2,W=z*3,ne=H*3,X=j*3,re=[z,H,j].map(se=>({x:C[se*3]*E.ws[se],y:C[se*3+1]*E.ws[se],z:C[se*3+2]*E.ws[se],w:E.ws[se]}));for(let se of[Re=>Re.z+Re.w,Re=>Re.w-Re.z]){let Re=[];for(let ut=0;ut<re.length;ut++){let R=re[ut],Ke=re[(ut+1)%re.length],Pe=se(R),ke=se(Ke);if(Pe>=0&&Re.push(R),Pe>=0!=ke>=0){let ye=Pe/(Pe-ke);Re.push({x:R.x+(Ke.x-R.x)*ye,y:R.y+(Ke.y-R.y)*ye,z:R.z+(Ke.z-R.z)*ye,w:R.w+(Ke.w-R.w)*ye})}}if(re=Re,re.length<3)break}if(re.length<3)continue;let le=re.map(se=>({x:(se.x/se.w*.5+.5)*s,y:(-se.y/se.w*.5+.5)*r,depth:se.z/se.w})),pe=le[0],Le=le[1],et=le[2],st=(Le.x-pe.x)*(et.y-pe.y)-(Le.y-pe.y)*(et.x-pe.x);if(st>=0&&d.side!==Ht||Math.abs(st)<.08||le.every(se=>se.x<0)||le.every(se=>se.x>s)||le.every(se=>se.y<0)||le.every(se=>se.y>r))continue;let qe=1;if(A){let se=A.getX(z),Re=A.getY(z),ut=A.getZ(z),R=m.matrixWorld.elements,Ke=R[0]*se+R[4]*Re+R[8]*ut,Pe=R[1]*se+R[5]*Re+R[9]*ut,ke=R[2]*se+R[6]*Re+R[10]*ut;qe=.64+.36*Math.max(0,-Ke*.45+Pe*.83+ke*.32)}let K=I.clone().convertLinearToSRGB(),Z=Math.min(255,K.r*255*qe),xe=Math.min(255,K.g*255*qe),Ue=Math.min(255,K.b*255*qe);h.push({pts:le,depth:le.reduce((se,Re)=>se+Re.depth,0)/le.length,rgb:[Z|0,xe|0,Ue|0],alpha:d.transparent?d.opacity:1})}});let g=this.image.data,y=this.depth;y.fill(2);let v=o.clone().convertLinearToSRGB();for(let m=0;m<g.length;m+=4)g[m]=v.r*255,g[m+1]=v.g*255,g[m+2]=v.b*255,g[m+3]=255;h.sort((m,d)=>(m.alpha<1)-(d.alpha<1)||d.depth-m.depth);for(let m of h)for(let d=1;d<m.pts.length-1;d++){let T=m.pts[0],_=m.pts[d],x=m.pts[d+1],A=Math.max(0,Math.floor(Math.min(T.x,_.x,x.x))),E=Math.min(s-1,Math.ceil(Math.max(T.x,_.x,x.x))),C=Math.max(0,Math.floor(Math.min(T.y,_.y,x.y))),P=Math.min(r-1,Math.ceil(Math.max(T.y,_.y,x.y))),M=(_.y-x.y)*(T.x-x.x)+(x.x-_.x)*(T.y-x.y);if(Math.abs(M)<.01)continue;let w=(_.y-x.y)/M,I=(x.x-_.x)/M,D=(x.y-T.y)/M,z=(T.x-x.x)/M;for(let H=C;H<=P;H++){let j=((_.y-x.y)*(A+.5-x.x)+(x.x-_.x)*(H+.5-x.y))/M,W=((x.y-T.y)*(A+.5-x.x)+(T.x-x.x)*(H+.5-x.y))/M;for(let ne=A;ne<=E;ne++,j+=w,W+=D){let X=1-j-W;if(j<-1e-5||W<-1e-5||X<-1e-5)continue;let re=j*T.depth+W*_.depth+X*x.depth,le=H*s+ne;if(re>y[le]+1e-7)continue;let pe=le*4,Le=m.alpha;g[pe]=m.rgb[0]*Le+g[pe]*(1-Le),g[pe+1]=m.rgb[1]*Le+g[pe+1]*(1-Le),g[pe+2]=m.rgb[2]*Le+g[pe+2]*(1-Le),Le>=1&&(y[le]=re)}}}i.putImageData(this.image,0,0),f.sort((m,d)=>d.depth-m.depth);for(let m of f)m.size>2&&m.size<s&&i.drawImage(m.image,m.x-m.size/2,m.y-m.size*m.aspect/2,m.size,m.size*m.aspect)}};function sh(a,e=!1){let n=a[0].index!==null,i=new Set(Object.keys(a[0].attributes)),s=new Set(Object.keys(a[0].morphAttributes)),r={},o={},l=a[0].morphTargetsRelative,u=new Ft,c=0;for(let h=0;h<a.length;++h){let f=a[h],p=0;if(n!==(f.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(let g in f.attributes){if(!i.has(g))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+'. All geometries must have compatible attributes; make sure "'+g+'" attribute exists among all geometries, or in none of them.'),null;r[g]===void 0&&(r[g]=[]),r[g].push(f.attributes[g]),p++}if(p!==i.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". Make sure all geometries have the same number of attributes."),null;if(l!==f.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(let g in f.morphAttributes){if(!s.has(g))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+".  .morphAttributes must be consistent throughout all geometries."),null;o[g]===void 0&&(o[g]=[]),o[g].push(f.morphAttributes[g])}if(e){let g;if(n)g=f.index.count;else if(f.attributes.position!==void 0)g=f.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". The geometry must have either an index or a position attribute"),null;u.addGroup(c,g,h),c+=g}}if(n){let h=0,f=[];for(let p=0;p<a.length;++p){let g=a[p].index;for(let y=0;y<g.count;++y)f.push(g.getX(y)+h);h+=a[p].attributes.position.count}u.setIndex(f)}for(let h in r){let f=ah(r[h]);if(!f)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" attribute."),null;u.setAttribute(h,f)}for(let h in o){let f=o[h][0].length;if(f===0)break;u.morphAttributes=u.morphAttributes||{},u.morphAttributes[h]=[];for(let p=0;p<f;++p){let g=[];for(let v=0;v<o[h].length;++v)g.push(o[h][v][p]);let y=ah(g);if(!y)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" morphAttribute."),null;u.morphAttributes[h].push(y)}}return u}function ah(a){let e,n,i,s=-1,r=0;for(let c=0;c<a.length;++c){let h=a[c];if(e===void 0&&(e=h.array.constructor),e!==h.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(n===void 0&&(n=h.itemSize),n!==h.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(i===void 0&&(i=h.normalized),i!==h.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(s===-1&&(s=h.gpuType),s!==h.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;r+=h.count*n}let o=new e(r),l=new It(o,n,i),u=0;for(let c=0;c<a.length;++c){let h=a[c];if(h.isInterleavedBufferAttribute){let f=u/n;for(let p=0,g=h.count;p<g;p++)for(let y=0;y<n;y++){let v=h.getComponent(p,y);l.setComponent(p+f,y,v)}}else o.set(h.array,u);u+=h.count*n}return s!==void 0&&(l.gpuType=s),l}var ql=Array.from({length:12},(a,e)=>({x:-21+e%4*4,z:-15+Math.floor(e/4)*4})),jt={carrot:{name:"Wortel",emoji:"\u{1F955}",duration:12e4,color:15243843},tomato:{name:"Tomat",emoji:"\u{1F345}",duration:18e4,color:14509393},corn:{name:"Jagung",emoji:"\u{1F33D}",duration:3e5,color:15386460}},Bg=[{id:"teacher",name:"Pak Tunas",x:-7,z:6,type:"npc",color:"#dc9b54"},{id:"lab",name:"Bu Flora",x:-4,z:-21,type:"lab",color:"#78988c"},{id:"shop",name:"Kios Benih",x:12,z:16,type:"shop",color:"#bd786d"},{id:"guard",name:"Pak Satpam",x:6.1,z:27.2,type:"guard",color:"#2f4a6d"}],yo=class{constructor(e,{onInteract:n,onZone:i,onObby:s,onReady:r,onJump:o}){this.canvas=e,this.callbacks={onInteract:n,onZone:i,onObby:s,onReady:r,onJump:o},this.scene=new Fa,this.scene.background=new Oe("#bedfdc"),this.scene.fog=new Na("#c9e0cf",62,140);try{this.renderer=new po({canvas:e,antialias:!0,alpha:!1,powerPreference:"high-performance"})}catch{let l=e.cloneNode(!0);e.replaceWith(l),this.canvas=l,e=l,this.renderer=new go(l)}this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5)),this.renderer.shadowMap.enabled=!0,this.renderer.shadowMap.type=yr,this.renderer.outputColorSpace=Et,this.renderer.toneMapping=Tr,this.renderer.toneMappingExposure=1.18,this.camera=new Pt(53,1,.1,200),this.player={x:0,z:12,y:0,yaw:Math.PI,moving:!1,vy:0,grounded:!0},this.camYaw=.55,this.camPitch=.48,this.zoom=11,this.keys={},this.joy={x:0,y:0},this.colliders=[],this.platforms=[],this.peerMap=new Map,this.sharedBuilds=[],this.plotRecords=[],this.selectedSlot=0,this.selectedTool="hand",this.raycaster=new Ja,this.clock=new Ka,this.time=0,this.interaction=null,this.batches=new Map,this.materials=new Map,this.buildMap=new Map,this.plotGroups=[],this.night=!1,this.lowQuality=!1,this.me=null,this.nametag=null,this.ambient=new ja("#fffce4","#81946f",2.2),this.scene.add(this.ambient),this.sun=new $a("#fff0c8",3.2),this.sun.position.set(-18,35,16),this.sun.castShadow=!0,this.sun.shadow.mapSize.set(1536,1536),this.sun.shadow.camera.left=-43,this.sun.shadow.camera.right=43,this.sun.shadow.camera.top=43,this.sun.shadow.camera.bottom=-43,this.sun.shadow.camera.near=.5,this.sun.shadow.camera.far=100,this.sun.shadow.normalBias=.04,this.scene.add(this.sun),this.buildWorld(),this.flushBatches(),this.createPlots(),this.localAvatar=this.makeAvatar("#de8d48",""),this.scene.add(this.localAvatar),this.createNPCs(),this.createHighlight(),this.bindInput(),this.resize(),this.camera.position.set(15,14,30),this.camera.lookAt(0,1,4),this.lastZone="Alun-alun",this.loop=this.loop.bind(this),requestAnimationFrame(this.loop),r?.()}mat(e,n={}){let i=e+JSON.stringify(n);return this.materials.has(i)||this.materials.set(i,new ea({color:e,roughness:.9,...n})),this.materials.get(i)}box(e,n,i,s,r,o,l,u={}){let c=new Lt(s,r,o,Math.max(1,Math.ceil(s/5)),Math.max(1,Math.ceil(r/5)),Math.max(1,Math.ceil(o/5)));c.translate(e,n,i);let h=String(l)+JSON.stringify(u);this.batches.has(h)||this.batches.set(h,{mat:this.mat(l,u),geos:[]}),this.batches.get(h).geos.push(c)}cone(e,n,i,s,r,o,l=5){let u=new Va(s,r,l);u.translate(e,n,i);let c=String(o);this.batches.has(c)||this.batches.set(c,{mat:this.mat(o),geos:[]}),this.batches.get(c).geos.push(u)}flushBatches(){for(let{mat:e,geos:n}of this.batches.values()){let i=sh(n),s=new yt(i,e);s.receiveShadow=!0,s.castShadow=!0,this.scene.add(s);for(let r of n)r.dispose()}this.batches.clear()}obstacle(e,n,i,s,r=3){this.colliders.push({x:e,z:n,w:i,d:s,h:r})}textSign(e,n,i,s,{size:r=3,color:o="#4d6c45",bg:l="#faf7df",rotation:u=0}={}){let c=document.createElement("canvas");c.width=512,c.height=128;let h=c.getContext("2d");h.fillStyle=l,h.fillRect(0,0,512,128),h.fillStyle=o,h.textAlign="center",h.textBaseline="middle",h.font="bold 39px Arial",h.fillText(e,256,67,480);let f=new fi(c);f.colorSpace=Et;let p=new yt(new pi(r,r/4),new Xn({map:f,side:Ht}));return p.position.set(n,i,s),p.rotation.y=u,this.scene.add(p),p}buildWorld(){this.box(0,-1.7,0,76,3,76,"#96ad71"),this.box(0,-3.4,0,72,1.2,72,"#7c9560"),this.box(0,-4.7,0,66,1.6,66,"#6d8255"),this.box(0,-.1,0,75,.2,75,"#b1c58b");for(let n=0;n<18;n++){let i=n/18*Math.PI*2,s=83+n%3*10;this.cone(Math.cos(i)*s,-2,Math.sin(i)*s,20+n%4*6,18+n%3*10,n%2?"#9bbba3":"#abc8ae",5)}this.clouds=[];for(let n=0;n<10;n++){let i=new Zt,s=new Xn({color:"#f5fae9",transparent:!0,opacity:.85});for(let r=0;r<4;r++){let o=new yt(new Lt(4+r%2*2,1.2,2.4),s);o.position.set(r*2,Math.sin(r)*.5,0),i.add(o)}i.position.set(-60+n*13,19+n%3*3,-45+n%4*22),this.scene.add(i),this.clouds.push(i)}this.box(0,.025,0,6,.06,72,"#e3d5ac"),this.box(0,.035,5,67,.06,5,"#e3d5ac"),this.box(-16,.04,-3,4,.07,21,"#e3d5ac"),this.box(-13,.04,-19,27,.07,3,"#e3d5ac"),this.box(18,.03,17,28,.06,4,"#e3d5ac"),this.box(0,.06,9,15,.12,15,"#dfd0a6");for(let n=0;n<9;n++)this.box(-4+n,.13,13.5,.65,.05,.25,"#c5b58b"),this.box(-4+n,.13,4.5,.65,.05,.25,"#c5b58b");this.box(0,.35,1,5,.7,5,"#c7bd95"),this.box(0,.75,1,4.5,.2,4.5,"#d8cda8"),this.box(0,.9,1,3.8,.1,3.8,"#93ab6c"),this.tree(0,1,1.3),this.obstacle(0,1,5,5,8),this.bench(-6,10,0),this.bench(6,10,Math.PI),this.lamp(-5,16),this.lamp(5,16),this.lamp(-5,-10),this.lamp(6,-18);for(let n of ql){this.box(n.x,.18,n.z,3.15,.36,3.15,"#9b744e"),this.box(n.x,.4,n.z-1.55,3.4,.35,.16,"#c6aa73"),this.box(n.x,.4,n.z+1.55,3.4,.35,.16,"#c6aa73"),this.box(n.x-1.55,.4,n.z,.16,.35,3.4,"#c6aa73"),this.box(n.x+1.55,.4,n.z,.16,.35,3.4,"#c6aa73");for(let i=0;i<3;i++)this.box(n.x-1+i,.38,n.z,.18,.08,2.6,"#806044")}this.fence(-25,-18,20,"x"),this.fence(-25,-18,17,"z"),this.fence(-25,-1,20,"x"),this.textSign("KEBUN PRAKTIK",-16,3.1,-18.1,{size:6}),this.box(-19,1.4,-18,.2,2.8,.2,"#967854"),this.box(-13,1.4,-18,.2,2.8,.2,"#967854"),this.greenhouse(-18,-27),this.textSign("GREENHOUSE",-18,4.2,-21.85,{size:5,color:"#43735e"}),this.box(0,.17,-28,14,.34,11,"#d3c49d"),this.box(0,.55,-21.9,8,.7,1.5,"#cbb98c"),this.platforms.push({x:0,z:-28,w:14,d:11,h:.34},{x:0,z:-21.9,w:8,d:1.5,h:.9});for(let n of[-6,6])for(let i of[-32.7,-23.2])this.box(n,2.8,i,.45,5.6,.45,"#d5c39c"),this.obstacle(n,i,.6,.6,5.6);this.box(0,5.5,-28,15,.5,12,"#759c87"),this.box(0,5.95,-28,13,.4,10,"#87ab94"),this.box(0,2,-33,13,4,.3,"#eae1be"),this.obstacle(0,-33,13,.4,4),this.textSign("LABORATORIUM TUMBUH",0,4.6,-22.1,{size:8}),this.box(0,2.5,-32.75,5,2,.05,"#426a52"),this.textSign("Belajar \u2022 Coba \u2022 Temukan",0,2.5,-32.69,{size:4.5,bg:"#426a52",color:"#e4eccb"});for(let n=-4;n<=4;n+=4)this.box(n,.95,-28,2.5,.22,1.4,"#c8ad76"),this.box(n,.5,-28,.22,1,1,"#987f52"),this.box(n,1.25,-28,.45,.5,.45,"#d7b06f"),this.cone(n,1.7,-28,.45,.7,"#6f9860");this.house(-18,19,"#d9c7a0","#ac7254"),this.house(-27,12,"#ecdfbc","#8a9a77",.75),this.house(-29,24,"#ded4b2","#9f7d65",.8),this.market(14,19),this.textSign("KIOS BENIH & GAYA",14,3.3,16.1,{size:5}),this.cart(8,21),this.box(-13,.04,30,18,.1,10,"#80b8b0"),this.box(-13,.055,30,15,.05,7,"#94c8bd"),this.box(-13,.07,30,10,.05,4,"#abd4c7"),this.box(-4,.2,28,3,.4,12,"#bda77b");for(let n=23;n<34;n++)this.box(-4,.44,n,3,.08,.8,"#cbb58b");for(let n=0;n<15;n++){let i=-23+n%5*4,s=n<5?25:35;this.box(i,.3,s,1.4,.6,1.1,"#a9b293");for(let r=0;r<3;r++)this.box(i+r*.2-.2,.85,s,.07,1.5+r%2*.4,.07,"#759866")}this.box(23,.02,-18,18,.04,19,"#c2c89c");for(let n=16;n<=30;n+=2)for(let i=-24;i<=-12;i+=2)this.box(n,.06,i,1.9,.07,1.9,(n+i)%4?"#b7c18e":"#bdc797");this.fence(14,-28,20,"x"),this.fence(34,-28,22,"z"),this.textSign("ATELIER KREATIF",23,3.3,-28,{size:6}),this.box(20,1.5,-28,.2,3,.2,"#978261"),this.box(26,1.5,-28,.2,3,.2,"#978261"),this.obby=[{x:12,z:0,h:.65},{x:15,z:-1,h:1.1},{x:18,z:-3,h:1.55},{x:21,z:-1,h:2},{x:24,z:-3,h:2.45},{x:27,z:0,h:2.8}];for(let n=0;n<this.obby.length;n++){let i=this.obby[n];this.box(i.x,i.h/2,i.z,2.35,i.h,2.35,n%2?"#aac691":"#93b6a5"),this.box(i.x,i.h+.05,i.z,2.5,.1,2.5,"#d1deb4"),this.platforms.push({...i,w:2.5,d:2.5}),this.textSign(String(n+1),i.x,i.h+.5,i.z+1.27,{size:.55,bg:"#f3f4dd",color:"#77935e"})}this.box(27,4.3,0,.12,3,.12,"#8b7958"),this.box(27.7,5.2,0,1.4,.85,.08,"#d5b260"),this.textSign("JALUR PENJELAJAH",16,2.5,4.3,{size:5}),this.box(13.5,1.1,4.4,.15,2.2,.15,"#9b835c"),this.box(18.5,1.1,4.4,.15,2.2,.15,"#9b835c"),this.box(-4.5,2.8,29,.65,5.6,.65,"#aac193"),this.box(4.5,2.8,29,.65,5.6,.65,"#aac193"),this.box(0,5.7,29,10,.6,1,"#8eac7a"),this.textSign("LEMBAH TUNAS",0,5.8,29.55,{size:7}),this.obstacle(-4.5,29,.8,.8,6),this.obstacle(4.5,29,.8,.8,6),this.guardPost(8.5,28.5);let e=[[-32,-31,1.5],[-27,-32,1.2],[-31,-22,1.2],[-31,-11,1.5],[-32,-2,1],[-29,4,.9],[-34,17,1.3],[-32,31,1.5],[-25,35,1.1],[-3,35,1.2],[7,34,1],[16,33,1.4],[24,33,1.3],[33,30,1.6],[33,19,1.2],[33,10,1.6],[32,-4,1.25],[34,-33,1.4],[26,-34,1.3],[17,-34,1.4],[9,-34,1.2],[-9,-35,1.3],[-10,22,.8],[-8,-3,.8],[8,9,.65],[24,25,.8]];for(let[n,i,s]of e)this.tree(n,i,s),this.obstacle(n,i,1.2*s,1.2*s,7*s);for(let n=0;n<75;n++){let i=Math.sin(n*47.13)*34,s=Math.cos(n*13.29)*34;Math.abs(i)<5||Math.abs(s-5)<4||i<-5&&s<0||i>10&&s<5||i<-7&&s>8||i>5&&i<11&&s>25&&s<32||(this.box(i,.13,s,.45,.26,.45,n%3?"#96b575":"#d7c58b"),this.box(i,.35,s,.15,.22,.15,n%2?"#e7b997":"#e5d891"))}}tree(e,n,i=1){this.box(e,2*i,n,.75*i,4*i,.75*i,"#9b8661"),this.box(e,4.3*i,n,3.8*i,2.5*i,3.4*i,"#81a46d"),this.box(e-.7*i,5.2*i,n+.3*i,3*i,2.2*i,3*i,"#92b37a"),this.box(e+.7*i,6.1*i,n-.3*i,2.5*i,1.8*i,2.7*i,"#a2bc86")}fence(e,n,i,s){for(let r=0;r<=i;r+=2.5)this.box(e+(s==="x"?r:0),.8,n+(s==="z"?r:0),.18,1.6,.18,"#c8b58a");for(let r of[.6,1.1])this.box(e+(s==="x"?i/2:0),r,n+(s==="z"?i/2:0),s==="x"?i:.12,.13,s==="z"?i:.12,"#d6c59d")}bench(e,n,i){this.box(e,.65,n,2.7,.25,.8,"#beaa7c"),this.box(e,1.1,n+(i===0?-.35:.35),2.7,.7,.13,"#c6b48b"),this.box(e-.9,.3,n,.2,.6,.6,"#89976e"),this.box(e+.9,.3,n,.2,.6,.6,"#89976e"),this.obstacle(e,n,3,1,1.4)}lamp(e,n){this.box(e,1.7,n,.15,3.4,.15,"#6d8268"),this.box(e,3.35,n,.7,.65,.7,"#eadfb0"),this.box(e,3.75,n,1,.15,1,"#7b9272")}house(e,n,i,s,r=1){this.box(e,2*r,n,7*r,4*r,6*r,i),this.box(e,4.25*r,n,8*r,.5*r,7*r,s),this.box(e,4.7*r,n,6.7*r,.5*r,5.6*r,s),this.box(e,5.1*r,n,5.4*r,.4*r,4.3*r,s),this.box(e,1.3*r,n-3.02*r,1.3*r,2.6*r,.08,"#688771");for(let o of[-2.2,2.2])this.box(e+o*r,2.5*r,n-3.05*r,1.1*r,1.2*r,.08,"#bad2bc"),this.box(e+o*r,2.5*r,n-3.1*r,.1,1.2*r,.05,"#f4e4b7");this.obstacle(e,n,7*r,6*r,5.4*r)}guardPost(e,n){let i={transparent:!0,opacity:.38,roughness:.2,depthWrite:!1};this.box(e,.12,n,3.6,.24,3.4,"#c9bea0"),this.box(e,.75,n,3.2,1.1,3,"#ebe4cf"),this.box(e,1.33,n,3.3,.12,3.1,"#385c4c");for(let s of[-1.48,1.48])for(let r of[-1.38,1.38])this.box(e+s,2.05,n+r,.24,1.5,.24,"#d5ccb2");this.box(e+1.48,2.05,n,.2,1.5,2.7,"#ebe4cf"),this.box(e,2.05,n+1.38,2.9,1.5,.2,"#ebe4cf"),this.box(e,2.05,n-1.38,2.7,1.2,.08,"#b8dce6",i),this.box(e-1.48,2.05,n,.08,1.2,2.5,"#b8dce6",i),this.box(e,2.85,n,4,.28,3.8,"#385c4c"),this.box(e,3.1,n,3.2,.24,3,"#4b735f"),this.textSign("POS SATPAM",e,3.15,n-1.72,{size:3.1,color:"#ffffff",bg:"#2b4d3e"}),this.cone(e-2.1,.45,n-1.5,.28,.75,"#e57a3c",6),this.obstacle(e,n,3.6,3.4,3.4)}market(e,n){this.box(e,1,n,6,2,3,"#d2b787"),this.box(e,2.1,n,6.6,.2,3.5,"#e8d7ad");for(let i of[-3,3])this.box(e+i,2,n+1.5,.18,4,.18,"#ad9467"),this.obstacle(e+i,n+1.5,.3,.3,4);for(let i=0;i<6;i++)this.box(e-2.75+i*1.1,4,n,1.1,.23,4.5,i%2?"#e7d8ac":"#a7ba87");for(let i=0;i<4;i++)this.box(e-2+i*1.4,2.4,n,.8,.4,.8,i%2?"#d69d59":"#a3b16b");this.obstacle(e,n,6,3,2.2)}cart(e,n){this.box(e,.9,n,3,.9,1.7,"#b99b67");for(let i of[-1,1])for(let s of[-1,1])this.box(e+i,.4,n+s,.45,.8,.3,"#7e8162");this.box(e-.4,1.6,n,1,1,.8,"#cba76d"),this.box(e+.5,1.5,n,.8,.8,.8,"#b1bb7b"),this.obstacle(e,n,3,2,2)}greenhouse(e,n){let i={transparent:!0,opacity:.3,roughness:.25,depthWrite:!1};this.box(e,.17,n,16,.34,10,"#c7d1ad");for(let s of[-8,8])this.box(e+s,2.4,n,.2,4.8,10,"#8eaa8e"),this.box(e+s,2.4,n,.08,4.3,9.5,"#c3e2d0",i),this.obstacle(e+s,n,.2,10,5);this.box(e,2.4,n-5,16,4.8,.08,"#c3e2d0",i),this.obstacle(e,n-5,16,.3,5);for(let s of[-5,5])for(let r of[-8,-4,4,8])this.box(e+r,2.4,n+s,.15,4.8,.15,"#8eaa8e");this.box(e,4.8,n,16.5,.16,10.5,"#a7c9b1",i),this.box(e,4.85,n+5,16.5,.23,.2,"#8aab8d"),this.box(e,4.85,n-5,16.5,.23,.2,"#8aab8d");for(let s of[-5.5,5.5]){this.box(e+s,1,n,2,1.5,6,"#ae9470"),this.box(e+s,1.8,n,2.2,.15,6.2,"#d1c298"),this.obstacle(e+s,n,2.2,6.2,1.9);for(let r of[-2,0,2])this.box(e+s,2,n+r,.7,.4,.7,"#c3ac7d"),this.cone(e+s,2.6,n+r,.55,.9,"#76a16d")}this.platforms.push({x:e,z:n,w:16,d:10,h:.34})}makeAvatar(e,n){let i=new Zt,s=(m,d,T,_,x,A,E,C=i)=>{let P=new yt(new Lt(m,d,T),this.mat(_));return P.position.set(x,A,E),P.castShadow=!0,P.receiveShadow=!0,C.add(P),P};s(.66,.85,.4,e,0,1.05,0);let r=s(.26,.75,.3,"#617580",-.21,.38,0),o=s(.26,.75,.3,"#617580",.21,.38,0),l=s(.22,.75,.3,"#e8bd8a",-.47,1.03,0),u=s(.22,.75,.3,"#e8bd8a",.47,1.03,0);s(.57,.55,.5,"#e8c699",0,1.78,0),s(.63,.11,.63,"#6a6350",0,2.07,0),s(.84,.1,.8,"#d6c28e",0,2.13,0),s(.58,.22,.55,"#e5d2a0",0,2.27,0),s(.065,.065,.02,"#354c3c",-.12,1.82,-.26),s(.065,.065,.02,"#354c3c",.12,1.82,-.26);let c={},h=m=>{let d=new Zt;return d.visible=!1,i.add(d),c[m]=d,d},f=h("glasses");s(.18,.13,.04,"#2d3b36",-.13,1.82,-.27,f),s(.18,.13,.04,"#2d3b36",.13,1.82,-.27,f),s(.1,.04,.04,"#2d3b36",0,1.83,-.27,f);let p=h("backpack");s(.5,.6,.26,"#8d5b3e",0,1.06,.31,p),s(.52,.14,.28,"#a8714e",0,1.32,.31,p),s(.34,.22,.05,"#d9c394",0,.98,.45,p);let g=h("scarf");s(.64,.14,.46,"#c85a48",0,1.48,0,g),s(.16,.36,.06,"#c85a48",.12,1.26,-.23,g);let y=h("apron");s(.56,.66,.05,"#f4eed6",0,.94,-.22,y),s(.34,.22,.06,"#d8caa4",0,.86,-.24,y);let v=h("sprout");if(s(.06,.22,.06,"#598b44",0,2.45,0,v),s(.22,.08,.12,"#82be5a",-.12,2.56,0,v),s(.22,.08,.12,"#93cf68",.12,2.53,0,v),i.userData={left:r,right:o,armL:l,armR:u,shirt:i.children[0],accessories:c,name:n},n){let m=this.nameSprite(n);m.position.y=2.8,i.add(m),i.userData.tag=m}return i}nameSprite(e){let n=document.createElement("canvas");n.width=384,n.height=80;let i=n.getContext("2d");i.fillStyle="#fffff1ed",i.beginPath(),i.roundRect(1,1,382,78,22),i.fill(),i.font="bold 29px Arial",i.textAlign="center",i.fillStyle="#3b6048",i.fillText(e.slice(0,25),192,51,355);let s=new fi(n);s.colorSpace=Et;let r=new Zi(new di({map:s,depthTest:!1}));return r.scale.set(2.6,.54,1),r.renderOrder=10,r}createNPCs(){this.npcs=[];for(let e of Bg){let n=this.makeAvatar(e.color,e.name);n.position.set(e.x,0,e.z),n.rotation.y=Math.PI,this.scene.add(n);let i=new yt(new Wa(.28),this.mat("#ebce75",{emissive:"#7d6f32",emissiveIntensity:.18}));i.position.set(e.x,3.3,e.z),this.scene.add(i),this.npcs.push({...e,mesh:n,marker:i})}}createPlots(){this.plotLabels=[];for(let e=0;e<12;e++){let n=ql[e],i=new Zt;i.position.set(n.x,.4,n.z),this.scene.add(i),this.plotGroups.push(i);let s=document.createElement("canvas");s.width=384,s.height=96;let r=new fi(s);r.colorSpace=Et;let o=new Zi(new di({map:r,depthTest:!1,transparent:!0}));o.scale.set(2.3,.58,1),o.renderOrder=9,o.visible=!1,o.position.set(n.x,1.5,n.z),o.userData={canvas:s,tex:r,key:""},this.scene.add(o),this.plotLabels.push(o)}this.lastPlantTick=0}createHighlight(){let e=new Ga(new Lt(3.5,.15,3.5));this.highlight=new Oa(e,new Qi({color:"#f3e8a5"})),this.scene.add(this.highlight),this.highlight.visible=!1,this.buildGhost=new yt(new Lt(1.9,1.9,1.9),new ea({color:"#f0df9c",transparent:!0,opacity:.5})),this.scene.add(this.buildGhost),this.buildGhost.visible=!1}setProfile(e,n="none"){this.localAvatar.userData.shirt.material=this.mat(e);let i=this.localAvatar.userData.accessories;if(i)for(let[s,r]of Object.entries(i))r.visible=s===n}setRecords(e,n,i){this.plotRecords=e||[],this.serverOffset=i-Date.now(),this.sharedBuilds=n||[];let s=new Set(this.sharedBuilds.map(r=>r.id));for(let[r,o]of this.buildMap)s.has(r)||(this.scene.remove(o),o.geometry.dispose(),this.buildMap.delete(r));for(let r of this.sharedBuilds)if(!this.buildMap.has(r.id)){let o=new yt(new Lt(1.9,1.9,1.9),this.mat(r.color));o.position.set(r.x,.95,r.z),o.castShadow=!0,o.receiveShadow=!0,this.scene.add(o),this.buildMap.set(r.id,o)}}setPeers(e,n,i){this.serverNow=i;let s=new Set(e.filter(r=>r.id!==n).map(r=>r.id));for(let[r,o]of this.peerMap)s.has(r)||(this.scene.remove(o),o.traverse(l=>{l.isSprite&&(l.material.map?.dispose(),l.material.dispose()),l.isMesh&&l.geometry.dispose()}),this.peerMap.delete(r));for(let r of e){if(r.id===n)continue;let o=this.peerMap.get(r.id);o||(o=this.makeAvatar(r.color,r.name),o.position.set((r.x-6)*6,r.elevation||0,(r.y-6)*6),this.peerMap.set(r.id,o),this.scene.add(o)),o.userData.target={x:(r.x-6)*6,y:r.elevation||0,z:(r.y-6)*6,yaw:r.yaw||0,moving:r.moving,emote:r.emote_at},o.userData.shirt.material=this.mat(r.color)}}plantVisuals(){let e=Date.now()+(this.serverOffset||0);for(let n=0;n<12;n++){let i=this.plotRecords.find(c=>c.slot===n),s=this.plotGroups[n],r=i?.crop?Math.min(3,Math.floor((e-i.planted_at)/(jt[i.crop].duration/3))):0,o=i?.crop?i.crop+":"+r+":"+i.watered+":"+i.fed:"",l=this.plotLabels?.[n];if(l)if(!i?.crop)l.visible=!1,l.userData.key="";else{let c=jt[i.crop],h=Math.max(0,Math.ceil((c.duration-(e-i.planted_at))/1e3)),f=Math.floor(h/60),p=String(h%60).padStart(2,"0"),g="",y="#fffff2ee",v="#2c523b",m="#cfe0bf";if(i.watered?i.fed?h>0?g=c.emoji+" "+f+":"+p:(g=c.emoji+" Siap panen!",y="#2b654bf0",v="#f5fbe8",m="#a9d483"):(g=c.emoji+" "+f+":"+p+" \xB7 Kompos",y="#fdf6e8ee",v="#7a5320",m="#ebd2a4"):(g=c.emoji+" "+f+":"+p+" \xB7 Siram",y="#eef7fcee",v="#2a5e7a",m="#b7d9ec"),l.position.y=.4+(.25+r*.4)+.55,l.visible=!0,l.userData.key!==g){l.userData.key=g;let d=l.userData.canvas.getContext("2d");d.clearRect(0,0,384,96),d.fillStyle=y,d.strokeStyle=m,d.lineWidth=4,d.beginPath(),d.roundRect(6,8,372,80,26),d.fill(),d.stroke(),d.font="bold 34px Arial",d.textAlign="center",d.textBaseline="middle",d.fillStyle=v,d.fillText(g,192,50,348),l.userData.tex.needsUpdate=!0}}if(s.userData.key===o)continue;for(s.userData.key=o;s.children.length;){let c=s.children[0];s.remove(c),c.geometry?.dispose()}if(!i?.crop)continue;let u=jt[i.crop].color;for(let c=0;c<6;c++){let h=-.85+c%3*.85,f=-.6+Math.floor(c/3)*1.2,p=.25+r*.4,g=new yt(new Lt(.13,p,.13),this.mat(i.watered?"#699450":"#8a9f5d"));g.position.set(h,p/2,f),s.add(g);for(let y=0;y<2;y++){let v=new yt(new Lt(.52,.15,.2),this.mat("#84aa62"));v.position.set(h+(y?-.2:.2),p*.7,f),v.rotation.z=y?.4:-.4,s.add(v)}if(r>=2){let y=new yt(new Lt(i.crop==="corn"?.22:.36,i.crop==="corn"?.6:.36,.32),this.mat(u));y.position.set(h,p*.8,f-.15),s.add(y)}}}}resize(){let e=innerWidth,n=innerHeight;this.renderer.setSize(e,n,!1),this.camera.aspect=e/n,this.camera.updateProjectionMatrix()}bindInput(){window.addEventListener("resize",()=>this.resize());let e=null;this.canvas.addEventListener("pointerdown",n=>{this.canvas.focus(),e={x:n.clientX,y:n.clientY,id:n.pointerId},this.canvas.setPointerCapture(n.pointerId)}),this.canvas.addEventListener("pointermove",n=>{!e||e.id!==n.pointerId||(this.camYaw-=(n.clientX-e.x)*.006,this.camPitch=Math.max(.15,Math.min(1.1,this.camPitch+(n.clientY-e.y)*.004)),e={x:n.clientX,y:n.clientY,id:n.pointerId})}),this.canvas.addEventListener("pointerup",()=>e=null),this.canvas.addEventListener("pointercancel",()=>e=null),this.canvas.addEventListener("wheel",n=>{n.preventDefault(),this.zoom=Math.max(5,Math.min(19,this.zoom+n.deltaY*.012))},{passive:!1}),window.addEventListener("keydown",n=>{/INPUT|TEXTAREA|SELECT/.test(n.target.tagName)||this.blocked||["w","a","s","d","W","A","S","D","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," ","Shift"].includes(n.key)&&(n.preventDefault(),this.keys[n.key.toLowerCase()]=!0,n.key===" "&&!n.repeat&&this.jump())}),window.addEventListener("keyup",n=>this.keys[n.key.toLowerCase()]=!1),window.addEventListener("blur",()=>{this.keys={},this.joy={x:0,y:0}})}jump(){this.blocked||this.player.grounded&&(this.player.vy=8.5,this.player.grounded=!1,this.callbacks.onJump?.())}setJoystick(e,n){this.joy={x:e,y:n}}canMove(e,n){if(e<-33||e>33||n<-33||n>35)return!1;let i=this.player.y;for(let s of this.colliders)if(i<s.h-.1&&Math.abs(e-s.x)<s.w/2+.33&&Math.abs(n-s.z)<s.d/2+.33)return!1;for(let s of this.sharedBuilds)if(i<1.8&&Math.abs(e-s.x)<1.28&&Math.abs(n-s.z)<1.28)return!1;for(let s of this.platforms)if(i<s.h-.18&&Math.abs(e-s.x)<s.w/2+.25&&Math.abs(n-s.z)<s.d/2+.25)return!1;return!0}move(e){let n=this.player;if(this.blocked){n.moving=!1;return}let i=(this.keys.d||this.keys.arrowright?1:0)-(this.keys.a||this.keys.arrowleft?1:0)+this.joy.x,s=(this.keys.s||this.keys.arrowdown?1:0)-(this.keys.w||this.keys.arrowup?1:0)+this.joy.y,r=Math.hypot(i,s);if(n.moving=r>.1,n.moving){i/=Math.max(1,r),s/=Math.max(1,r);let u=(this.keys.shift?8:5.5)*e,c=Math.cos(this.camYaw)*i+Math.sin(this.camYaw)*s,h=-Math.sin(this.camYaw)*i+Math.cos(this.camYaw)*s,f=n.x+c*u,p=n.z+h*u;this.canMove(f,n.z)&&(n.x=f),this.canMove(n.x,p)&&(n.z=p),n.yaw=Math.atan2(-c,-h)}let o=n.y;n.vy-=23*e,n.y+=n.vy*e;let l=0;for(let u of this.platforms)Math.abs(n.x-u.x)<u.w/2+.22&&Math.abs(n.z-u.z)<u.d/2+.22&&o>=u.h-.13&&n.vy<=0&&(l=Math.max(l,u.h));for(let u of this.sharedBuilds)Math.abs(n.x-u.x)<1.18&&Math.abs(n.z-u.z)<1.18&&o>=1.8&&n.vy<=0&&(l=Math.max(l,1.9));n.y<=l?(n.y=l,n.vy=0,n.grounded=!0):n.grounded=!1,n.x>25.8&&n.x<28.3&&Math.abs(n.z)<1.2&&n.y>2.7&&!this.obbyTriggered&&(this.obbyTriggered=!0,this.callbacks.onObby?.())}animateAvatar(e,n,i,s=!1){let{left:r,right:o,armL:l,armR:u}=e.userData,c=n?Math.sin(i*11)*.65:Math.sin(i*2)*.025;r.rotation.x=c,o.rotation.x=-c,l.rotation.x=-c*.75,u.rotation.x=c*.75,u.rotation.z=s?-2.5+Math.sin(i*12)*.3:0}nearest(){let e=this.player,n=null,i=5;for(let s of this.npcs){let r=Math.hypot(e.x-s.x,e.z-s.z);r<i&&(i=r,n={...s})}for(let s=0;s<12;s++){let r=ql[s],o=Math.hypot(e.x-r.x,e.z-r.z);o<Math.min(i,3.6)&&(i=o,n={type:"plot",slot:s,...r,record:this.plotRecords.find(l=>l.slot===s)})}if(this.selectedTool==="build"&&e.x>12&&e.x<33&&e.z<-8&&e.z>-29){let s=Math.round((e.x-Math.sin(e.yaw)*3)/2)*2,r=Math.round((e.z-Math.cos(e.yaw)*3)/2)*2;s=Math.max(16,Math.min(30,s)),r=Math.max(-24,Math.min(-12,r)),n={type:"build",x:s,z:r,existing:this.sharedBuilds.find(o=>o.x===s&&o.z===r)}}return n}getZone(){let e=this.player;return e.x<-7&&e.z<-19?"Greenhouse":e.x<-6&&e.z<1?"Kebun praktik":e.z<-20&&Math.abs(e.x)<9?"Laboratorium":e.x>12&&e.z<-9?"Atelier kreatif":e.x>10&&e.z<5?"Jalur penjelajah":e.z>22&&e.x<-2?"Telaga teduh":e.x>8&&e.z>10?"Pasar desa":e.x<-10&&e.z>10?"Desa Tunas":"Alun-alun"}setNight(e){this.night=e,this.scene.background.set(e?"#586977":"#bedfdc"),this.scene.fog.color.set(e?"#697f79":"#c9e0cf"),this.ambient.intensity=e?1:2.2,this.sun.intensity=e?.6:3.2}setQuality(e){this.lowQuality=e,this.renderer.setPixelRatio(e?1:Math.min(devicePixelRatio,1.5)),this.renderer.shadowMap.enabled=!e,this.scene.traverse(n=>{n.material&&(n.material.needsUpdate=!0)})}resetPosition(){Object.assign(this.player,{x:(Math.random()-.5)*4,z:12+Math.random()*2,y:0,vy:0}),this.obbyTriggered=!1}drawMap(){let e=document.getElementById("minimap"),n=e.getContext("2d"),i=240/76;n.fillStyle="#b6c998",n.fillRect(0,0,240,240);let s=(o,l,u,c,h)=>{n.fillStyle=h,n.fillRect((o-u/2+38)*i,(l-c/2+38)*i,u*i,c*i)};s(0,0,6,72,"#e3d5ac"),s(0,5,67,5,"#e3d5ac"),s(-16,-11,20,15,"#947c54"),s(-18,-27,16,10,"#83aaa0"),s(0,-28,14,11,"#6c9985"),s(-18,19,7,6,"#ad8260"),s(14,19,6,4,"#b4a175"),s(-13,30,18,10,"#7db3aa"),s(23,-18,18,19,"#c4c99c");for(let o of this.obby)s(o.x,o.z,2.5,2.5,"#8aaa91");for(let o of this.peerMap.values())n.fillStyle="#e4b76b",n.beginPath(),n.arc((o.position.x+38)*i,(o.position.z+38)*i,3,0,7),n.fill();let r=this.player;n.save(),n.translate((r.x+38)*i,(r.z+38)*i),n.rotate(-r.yaw),n.fillStyle="#2a6249",n.strokeStyle="#ffffed",n.lineWidth=2,n.beginPath(),n.moveTo(0,-6),n.lineTo(4.5,5),n.lineTo(0,3),n.lineTo(-4.5,5),n.closePath(),n.fill(),n.stroke(),n.restore()}loop(){requestAnimationFrame(this.loop);let e=Math.min(this.clock.getDelta(),.045);this.time+=e,this.move(e);let n=this.player;this.localAvatar.position.set(n.x,n.y,n.z),this.localAvatar.rotation.y=n.yaw,this.animateAvatar(this.localAvatar,n.moving,this.time,this.waveUntil>Date.now());for(let r of this.peerMap.values()){let o=r.userData.target;if(!o)continue;r.position.lerp(new U(o.x,o.y,o.z),Math.min(1,e*6));let l=Math.atan2(Math.sin(o.yaw-r.rotation.y),Math.cos(o.yaw-r.rotation.y));r.rotation.y+=l*Math.min(1,e*8),this.animateAvatar(r,o.moving,this.time,o.emote>(this.serverNow||0)-3500)}let i=Math.cos(this.camPitch)*this.zoom,s=new U(n.x+Math.sin(this.camYaw)*i,n.y+2.2+Math.sin(this.camPitch)*this.zoom,n.z+Math.cos(this.camYaw)*i);this.camera.position.lerp(s,Math.min(1,e*5)),this.camera.lookAt(n.x,n.y+1.3,n.z);for(let r=0;r<this.clouds.length;r++)this.clouds[r].position.x+=e*(.15+r*.008);for(let r of this.npcs)r.marker.position.y=3.3+Math.sin(this.time*2)*.15,r.marker.rotation.y=this.time;if(this.interaction=this.nearest(),this.highlight.visible=this.interaction?.type==="plot",this.highlight.visible&&this.highlight.position.set(this.interaction.x,.55,this.interaction.z),this.buildGhost.visible=this.interaction?.type==="build",this.buildGhost.visible&&this.buildGhost.position.set(this.interaction.x,.96,this.interaction.z),this.time-this.lastPlantTick>.5){this.lastPlantTick=this.time,this.plantVisuals(),this.drawMap();let r=this.getZone();r!==this.lastZone&&(this.lastZone=r,this.callbacks.onZone?.(r)),this.callbacks.onInteract?.(this.interaction)}this.renderer.render(this.scene,this.camera)}};var B=a=>document.getElementById(a),lh;try{lh=JSON.parse(localStorage.getItem("agroquest-v1")||"null")}catch{}var q={name:"Petani Muda",color:"#de8d48",accessory:"none",completed:[],journal:[],bank:0,farmXP:0,spentXP:0,harvested:0,flags:{},soloPlots:[],soloBuilds:[],earnings:{},ownedColors:["#de8d48"],ownedAccessories:["none"],...lh};for(let a of["completed","journal","soloPlots","soloBuilds","ownedColors","ownedAccessories"])Array.isArray(q[a])||(q[a]=[]);q.ownedColors.includes(q.color)||q.ownedColors.push(q.color);q.ownedAccessories.includes(q.accessory)||q.ownedAccessories.push(q.accessory);q.spentXP=Number(q.spentXP)||0;q.flags=q.flags||{};q.earnings=q.earnings||{};var ct=new fs,Zn=null,me,Si="hand",Qn="carrot",da=!1,$e=null,os=[],ls,jl=!1;var rh=0,Og=Date.now(),Yl=!localStorage.getItem("agroquest-worlds-intro"),$l=null,xo=null,oh=!1;var _o=q.color;try{$e=JSON.parse(sessionStorage.getItem("agroquest-room")||"null")}catch{}function bn(){try{localStorage.setItem("agroquest-v1",JSON.stringify(q))}catch{}Zn?.mark()}function Ze(a){B("toast").textContent=a,B("toast").classList.add("show"),clearTimeout(window.toastTimeout),window.toastTimeout=setTimeout(()=>B("toast").classList.remove("show"),3700),ct.fx(/berhasil|selesai|tuntas/i.test(a)?"success":"click")}function kt(a,e=!1){B("overlay").classList.contains("open")||($l=document.activeElement),B("modal").classList.remove("learning"),B("modalbody").innerHTML=a,B("modal").classList.toggle("wide",e),B("overlay").classList.add("open"),me&&(me.blocked=!0,me.keys={},me.setJoystick(0,0)),clearInterval(xo),xo=null,B("close").focus()}function Yt(){clearInterval(xo),B("overlay").classList.remove("open"),me&&(me.blocked=!1),$l?.isConnected&&$l.focus()}B("close").onclick=Yt;B("overlay").onclick=a=>{a.target===B("overlay")&&Yt()};var Mo=[{title:"Siap sebelum ke kebun",zone:"Pos Pak Tunas",emoji:"\u{1F97E}",text:"Keselamatan adalah langkah pertama. Pilih APD sesuai risiko: sepatu bot atau sepatu tertutup, sarung tangan sesuai pekerjaan, dan pelindung dari panas. Periksa kondisi alat. Alat dengan gagang longgar harus dihentikan penggunaannya dan dilaporkan untuk diperbaiki.",q:"Cangkul yang akan kamu pakai memiliki gagang longgar. Apa tindakan paling tepat?",answers:["Tetap dipakai agar cepat selesai","Hentikan penggunaan dan laporkan untuk diperbaiki","Dipinjamkan kepada teman"],correct:1,reason:"Alat rusak harus diperbaiki sebelum dipakai agar tidak mencederai diri sendiri atau orang lain."},{title:"Rumah nyaman untuk akar",zone:"Laboratorium",emoji:"\u{1FAB4}",text:"Akar membutuhkan air, udara, dan unsur hara. Media yang baik menahan air secukupnya dan memiliki pori agar air berlebih dapat mengalir. Kompos matang membantu menyediakan bahan organik. Komposisi media disesuaikan dengan komoditas dan lingkungan; pupuk kandang segar sebaiknya tidak diberikan langsung pada bibit.",q:"Media semai selalu tergenang. Apa yang paling perlu diperbaiki?",answers:["Frekuensi penyiraman ditambah","Semua lubang pot ditutup","Drainase dan porositas media diperbaiki"],correct:2,reason:"Drainase mengalirkan air berlebih dan porositas menjaga ruang udara untuk akar."},{title:"Dari benih menjadi tunas",zone:"Kebun praktik",emoji:"\u{1F331}",text:"Gunakan benih berkualitas dan media bersih. Kedalaman tanam mengikuti kebutuhan benih. Jaga media lembap, bukan tergenang. Bibit dipindahkan ketika sehat dan cukup berkembang sesuai komoditas. Lakukan adaptasi bibit secara bertahap sebelum ditanam di lahan.",q:"Kondisi media semai yang umumnya baik untuk perkecambahan adalah\u2026",answers:["Lembap dengan drainase baik","Selalu tergenang air","Kering total"],correct:0,reason:"Kelembapan mendukung perkecambahan, sedangkan drainase mengurangi risiko kekurangan oksigen dan pembusukan."},{title:"Jadi pengamat tanaman",zone:"Greenhouse",emoji:"\u{1F50E}",text:"Amati kelembapan media sebelum menyiram. Kebutuhan air berubah sesuai cuaca, fase tumbuh, dan tanaman. Dalam pengendalian hama terpadu, amati gejala dan identifikasi penyebab sebelum menentukan tindakan. Daun layu dapat disebabkan kekurangan air maupun gangguan akar.",q:"Beberapa daun berlubang. Langkah awal yang tepat adalah\u2026",answers:["Menyemprot semua tanaman tanpa pemeriksaan","Mengamati gejala dan mengidentifikasi penyebab","Menambah pupuk sebanyak mungkin"],correct:1,reason:"Identifikasi membantu memilih tindakan sesuai penyebab dan tingkat serangan."},{title:"Panen, mutu, dan usaha",zone:"Pasar desa",emoji:"\u{1F9FA}",text:"Indikator panen bergantung pada komoditas dan tujuan pasar. Gunakan alat bersih dan perlakukan hasil dengan lembut. Lakukan sortasi dan pengemasan yang sesuai. Catat hasil panen serta biaya untuk mengevaluasi usaha. Simulasi pertumbuhan dalam game dipercepat; tanaman nyata memerlukan waktu sesuai jenisnya.",q:"Tindakan yang membantu menjaga mutu sayuran setelah panen adalah\u2026",answers:["Membiarkan hasil di terik matahari selama mungkin","Melempar hasil ke wadah agar cepat","Menangani dengan hati-hati, menyortir, dan menyimpan sesuai kebutuhan komoditas"],correct:2,reason:"Penanganan lembut dan penyimpanan sesuai komoditas mengurangi kerusakan serta penurunan mutu."}];function pa(){return q.completed.length*100+q.farmXP+(q.flags.obby?100:0)}function fa(){return Math.max(0,pa()-(q.spentXP||0))}function wi(){return q.completed.length*50+q.bank+(q.flags.obby?50:0)}function vn(){B("playername").textContent=q.name,B("level").textContent="Level "+(1+Math.floor(pa()/200))+" \xB7 Penjelajah",B("coins").textContent=wi(),B("xphud")&&(B("xphud").textContent=fa());let a=[["Kenali K3 bersama Pak Tunas",q.completed.includes(0)],["Tanam satu benih di kebun",q.flags.plant],["Siram dan beri kompos",q.flags.water&&q.flags.feed],["Panen hasil pertamamu",q.harvested>0]];B("queststeps").innerHTML=a.map(([e,n])=>`<div class="quest-step ${n?"done":""}"><span class="step-circle">${n?"\u2713":"\xB7"}</span><span>${e}</span></div>`).join(""),me?.setProfile(q.color,q.accessory)}var ch=[["hand","\u270B","Jelajah"],["seed","\u{1F331}","Benih"],["water","\u{1F4A7}","Siram"],["feed","\u{1F342}","Kompos"],["harvest","\u{1F9FA}","Panen"],["build","\u{1F9F1}","Bangun"]];function So(a){Si=a,me&&(me.selectedTool=a),document.querySelectorAll("[data-tool]").forEach(e=>e.classList.toggle("active",e.dataset.tool===a)),a==="seed"&&Ze("Benih "+jt[Qn].name+" dipilih. Dekati petak lalu tekan E."),a==="build"&&Ze("Bangun di Atelier Kreatif. Tekan E untuk pasang / ambil blok."),me&&fh(me.interaction)}B("hotbar").innerHTML=ch.map(([a,e,n],i)=>`<button class="slot ${i===0?"active":""}" data-tool="${a}" aria-label="${n}"><span class="key">${i+1}</span><span class="item">${e}</span><span class="label">${n}</span></button>`).join("");document.querySelectorAll("[data-tool]").forEach(a=>a.onclick=()=>So(a.dataset.tool));function bo(a){let e=Mo[a];kt(`<div class="tiny">${e.zone} \xB7 KUIS 0${a+1}</div><div style="font-size:45px;margin:20px 0 5px">${e.emoji}</div><h2 id="modaltitle">${e.title}</h2><p>${e.text}</p><div class="rewards" style="margin:15px 0">\u2726 100 XP &nbsp; \u25C9 50 koin ${q.completed.includes(a)?"\xB7 Hadiah sudah diterima":""}</div><button class="primary" id="startquiz">Saya paham, mulai tantangan \u2192</button><button class="secondary-btn" id="fullmaterial">Baca materi lengkap \u2192</button>`),B("startquiz").onclick=()=>zg(a),B("fullmaterial").onclick=()=>cs.open(["k3","media","benih","opt","panen"][a])}function zg(a){let e=Mo[a];kt(`<div class="tiny">Tantangan pengetahuan</div><h2 id="modaltitle">${e.q}</h2>${e.answers.map((n,i)=>`<button class="option" data-answer="${i}">${String.fromCharCode(65+i)}. ${n}</button>`).join("")}<p id="feedback" aria-live="polite"></p><button class="primary" id="quiznext" hidden>Lanjutkan</button>`),document.querySelectorAll("[data-answer]").forEach(n=>n.onclick=()=>{let i=+n.dataset.answer===e.correct;document.querySelectorAll("[data-answer]").forEach(s=>{s.disabled=!0,+s.dataset.answer===e.correct&&s.classList.add("correct")}),i||n.classList.add("wrong"),B("feedback").textContent=(i?"\u2713 Benar! ":"Belum tepat. ")+e.reason,B("quiznext").hidden=!1,B("quiznext").textContent=i?"Selesaikan misi \u2192":"Pelajari kembali \u2192",B("quiznext").onclick=()=>{if(!i)return bo(a);q.completed.includes(a)||(q.completed.push(a),q.journal.push({mission:a,date:new Date().toLocaleDateString("id-ID"),text:e.reason}),bn(),vn(),Ze("Misi selesai! +100 XP, +50 koin.")),Yt()}})}function Jl(){kt(`<div class="tiny">Buku petualangan \xB7 ATPH SMK</div><h2 id="modaltitle">Belajar, lalu buktikan.</h2><p>Kuis menguji pemahamanmu. Praktikkan pengetahuan di kebun 3D: tanam, siram, beri kompos matang, dan panen. Pertumbuhan game dipercepat menjadi 2\u20135 menit setelah tanam.</p><button class="secondary-btn" id="missionmaterials" style="margin-bottom:15px">\u{1F4DA} Buka 12 materi pembelajaran lengkap \u2192</button><div class="grid">${Mo.map((a,e)=>`<div class="itemcard"><span class="big">${a.emoji}</span><strong>${a.title}</strong><p>${a.zone} \xB7 100 XP \xB7 50 koin</p><button data-lesson="${e}">${q.completed.includes(e)?"\u2713 Pelajari kembali":"Mulai tantangan \u2192"}</button></div>`).join("")}<div class="itemcard"><span class="big">\u{1F6A9}</span><strong>Penjelajah tangguh</strong><p>Lompati 6 platform di timur alun-alun. Capai bendera dan jawab tantangan.</p><button id="goobby">Ke jalur penjelajah \u2192</button></div></div><p class="smallnote">Progres belajar disimpan di browser perangkat ini. Belum merupakan rapor guru.</p>`,!0),document.querySelectorAll("[data-lesson]").forEach(a=>a.onclick=()=>bo(+a.dataset.lesson)),B("goobby").onclick=()=>Zl("Jalur penjelajah",9,3),B("missionmaterials").onclick=()=>cs.library()}B("navmissions").onclick=Jl;B("questguide").onclick=Jl;function uh(){kt(`<div class="tiny">Jejak pertumbuhanmu</div><h2 id="modaltitle">Jurnal belajar \u{1F4D6}</h2><div class="row"><span>\u2726 ${pa()} XP</span><span>\u{1F9FA} ${q.harvested} panen</span><span>\u2713 ${q.completed.length}/5 kuis</span></div><div class="levelbar"><i style="width:${Math.min(100,q.completed.length/5*100)}%"></i></div>${q.journal.length?q.journal.slice().reverse().map(a=>`<div class="itemcard" style="margin:10px 0"><strong>${Mo[a.mission]?.title||"Praktik budidaya"}</strong><span class="muted">${a.date}</span><p>${a.text}</p></div>`).join(""):"<p>Setelah menyelesaikan kuis, pengetahuanmu akan tercatat di sini.</p>"}<p class="smallnote">Jurnal tersimpan pada perangkat ini.</p>`)}B("navjournal").onclick=uh;function hh(){kt(`<div class="tiny">Peralatan & pencapaian</div><h2 id="modaltitle">Ransel penjelajah \u{1F392}</h2><div class="row"><span>\u25C9 ${wi()} koin</span><span>\u2726 ${pa()} XP</span></div><div class="grid" style="margin-top:18px">${Object.entries(jt).map(([a,e])=>`<div class="itemcard"><span class="big">${e.emoji}</span><strong>Benih ${e.name}</strong><p>Persediaan latihan tanpa batas. Siap panen ${Math.round(e.duration/6e4)} menit jika sudah disiram dan diberi kompos.</p><button data-seed="${a}">${Qn===a?"\u2713 Sedang dipakai":"Pilih benih"}</button></div>`).join("")}<div class="itemcard"><span class="big">\u{1F3C5}</span><strong>${q.completed.length} lencana pengetahuan</strong><p>${q.harvested} kali panen. ${q.flags.obby?"Bendera jalur penjelajah sudah diraih.":"Bendera penjelajah menantimu."}</p><button id="bagjournal">Buka jurnal</button></div></div>`),document.querySelectorAll("[data-seed]").forEach(a=>a.onclick=()=>{Qn=a.dataset.seed,Yt(),So("seed")}),B("bagjournal").onclick=uh}B("bag").onclick=hh;var ua=[{color:"#de8d48",name:"Kaos Petani Klasik",xp:0,coins:0},{color:"#67937c",name:"Seragam Kebun Hijau",xp:60,coins:80},{color:"#7564a7",name:"Jaket Peneliti Ungu",xp:60,coins:80},{color:"#c45f68",name:"Rompi Agribisnis Merah",xp:60,coins:80},{color:"#488bb0",name:"Kemeja Hidroponik Biru",xp:60,coins:80},{color:"#34495e",name:"Jas Lab Gelap",xp:90,coins:120},{color:"#d4a24e",name:"Wearpack Panen Emas",xp:90,coins:120},{color:"#2e7d5b",name:"Seragam ATPH Pro",xp:120,coins:150}],ha=[{id:"none",emoji:"\u{1F9D1}",name:"Tanpa Aksesoris",xp:0,coins:0},{id:"scarf",emoji:"\u{1F9E3}",name:"Syal Kebun",xp:60,coins:80},{id:"glasses",emoji:"\u{1F453}",name:"Kacamata Peneliti",xp:80,coins:100},{id:"apron",emoji:"\u{1F9BA}",name:"Celemek Kebun",xp:90,coins:110},{id:"backpack",emoji:"\u{1F392}",name:"Ransel Lapangan",xp:100,coins:120},{id:"sprout",emoji:"\u{1F331}",name:"Tunas Topi",xp:110,coins:140}];function ca(a,e,n){let i=a==="outfit"?ua.find(r=>r.color===e):ha.find(r=>r.id===e);if(!i)return;let s=a==="outfit"?q.ownedColors:q.ownedAccessories;if(!s.includes(e)){let r=n==="xp"?i.xp:i.coins;if(n==="xp"){if(fa()<r)return Ze("XP belum cukup. Selesaikan kuis atau panen dahulu.");q.spentXP=(q.spentXP||0)+r}else{if(wi()<r)return Ze("Koin belum cukup. Selesaikan kuis atau panen dahulu.");q.bank-=r}s.push(e),Ze(i.name+" berhasil dibeli!")}a==="outfit"?(q.color=e,_o=e):q.accessory=e,bn(),vn()}function Jn(){kt(`<div class="tiny">Pasar desa \xB7 Benih, pakaian & aksesoris</div><h2 id="modaltitle">Kios Tunas \u{1F33E}</h2><p>Benih latihan gratis. Gunakan <b>XP</b> atau <b>Koin</b> hasil belajar untuk membeli pakaian dan aksesoris penjelajah.</p><div class="row" style="margin-bottom:14px"><span>\u2726 <b>${fa()} XP</b> tersedia</span><span>\u25C9 <b>${wi()} Koin</b></span></div><div class="grid">${Object.entries(jt).map(([a,e])=>`<div class="itemcard"><span class="big">${e.emoji}</span><strong>Benih ${e.name}</strong><p>${Math.round(e.duration/6e4)} menit / siklus game \xB7 Gratis</p><button data-seed="${a}">Pakai benih ini \u2192</button></div>`).join("")}</div><h3 style="margin:22px 0 10px">\u{1F455} Pakaian & Seragam</h3><div class="grid">${ua.map(a=>{let e=q.ownedColors.includes(a.color),n=q.color===a.color;return`<div class="itemcard"><span class="big" style="display:inline-block;width:30px;height:30px;border-radius:9px;background:${a.color};border:2px solid #dfe7d3"></span><strong>${a.name}</strong><p>${e?n?"Sedang dipakai":"Sudah dimiliki":`${a.xp} XP atau ${a.coins} koin`}</p>${e?`<button data-equip-outfit="${a.color}">${n?"\u2713 Dipakai":"Pakai pakaian"}</button>`:`<div class="row" style="gap:6px"><button data-buy-outfit-xp="${a.color}">Beli ${a.xp} XP</button><button data-buy-outfit-coin="${a.color}">Beli ${a.coins} Koin</button></div>`}</div>`}).join("")}</div><h3 style="margin:22px 0 10px">\u{1F392} Aksesoris Penjelajah</h3><div class="grid">${ha.filter(a=>a.id!=="none").map(a=>{let e=q.ownedAccessories.includes(a.id),n=q.accessory===a.id;return`<div class="itemcard"><span class="big">${a.emoji}</span><strong>${a.name}</strong><p>${e?n?"Sedang dipakai":"Sudah dimiliki":`${a.xp} XP atau ${a.coins} koin`}</p>${e?`<button data-equip-acc="${a.id}">${n?"\u2713 Dipakai":"Pakai aksesoris"}</button>`:`<div class="row" style="gap:6px"><button data-buy-acc-xp="${a.id}">Beli ${a.xp} XP</button><button data-buy-acc-coin="${a.id}">Beli ${a.coins} Koin</button></div>`}</div>`}).join("")}</div>`,!0),document.querySelectorAll("[data-seed]").forEach(a=>a.onclick=()=>{Qn=a.dataset.seed,Yt(),So("seed")}),document.querySelectorAll("[data-equip-outfit]").forEach(a=>a.onclick=()=>{ca("outfit",a.dataset.equipOutfit,"xp"),Jn()}),document.querySelectorAll("[data-buy-outfit-xp]").forEach(a=>a.onclick=()=>{ca("outfit",a.dataset.buyOutfitXp,"xp"),Jn()}),document.querySelectorAll("[data-buy-outfit-coin]").forEach(a=>a.onclick=()=>{ca("outfit",a.dataset.buyOutfitCoin,"coins"),Jn()}),document.querySelectorAll("[data-equip-acc]").forEach(a=>a.onclick=()=>{ca("acc",a.dataset.equipAcc,"xp"),Jn()}),document.querySelectorAll("[data-buy-acc-xp]").forEach(a=>a.onclick=()=>{ca("acc",a.dataset.buyAccXp,"xp"),Jn()}),document.querySelectorAll("[data-buy-acc-coin]").forEach(a=>a.onclick=()=>{ca("acc",a.dataset.buyAccCoin,"coins"),Jn()})}B("navshop").onclick=Jn;function dh(){kt('<div class="tiny">Avatar & identitas</div><h2 id="modaltitle">Penjelajah versimu.</h2><div class="row" style="margin-bottom:12px"><span>\u2726 <b>'+fa()+" XP</b> tersedia</span><span>\u25C9 <b>"+wi()+' Koin</b></span></div><label for="profilename">Nama panggilan</label><input id="profilename" maxlength="25" autocomplete="off"><p>Pakaian & warna baju (beli dengan XP atau Koin)</p><div id="colors"></div><p id="colorcost"></p><p style="margin-top:14px">Aksesoris avatar</p><div id="accessories" class="grid" style="margin-bottom:10px"></div><p id="acccost"></p><button class="primary" id="saveprofile">Simpan avatar</button><p class="smallnote">Saat di kelas, nama pada daftar tetap mengikuti nama saat masuk. Keluar lalu masuk kembali untuk menggantinya.</p>'),B("profilename").value=q.name;let a=q.color,e=q.accessory,n=()=>{B("colors").innerHTML="",ua.forEach(r=>{let o=document.createElement("button");o.style.background=r.color,o.className="costume"+(a===r.color?" chosen":""),o.setAttribute("aria-label",r.name),o.title=r.name,o.onclick=()=>{a=r.color,n()},B("colors").append(o)});let s=ua.find(r=>r.color===a)||ua[0];B("colorcost").textContent=q.ownedColors.includes(a)?`\u2713 ${s.name} sudah dimiliki`:`${s.name} \xB7 ${s.xp} XP atau ${s.coins} koin (buka di Toko atau beli saat simpan dengan Koin/XP)`},i=()=>{B("accessories").innerHTML="",ha.forEach(r=>{let o=document.createElement("button");o.className="option"+(e===r.id?" correct":""),o.style.margin="0",o.textContent=r.emoji+" "+r.name+(q.ownedAccessories.includes(r.id)?"":" ("+r.xp+" XP / "+r.coins+" Koin)"),o.onclick=()=>{e=r.id,i()},B("accessories").append(o)});let s=ha.find(r=>r.id===e)||ha[0];B("acccost").textContent=q.ownedAccessories.includes(e)?`\u2713 ${s.name} siap dipakai`:`${s.name} \xB7 ${s.xp} XP atau ${s.coins} koin`};n(),i(),B("saveprofile").onclick=()=>{let s=B("profilename").value.trim();if(s.length<2)return Ze("Nama panggilan minimal 2 karakter.");if(!q.ownedColors.includes(a)){let r=ua.find(o=>o.color===a);if(fa()>=r.xp)q.spentXP=(q.spentXP||0)+r.xp,q.ownedColors.push(a);else if(wi()>=r.coins)q.bank-=r.coins,q.ownedColors.push(a);else return Ze("XP atau Koin belum cukup untuk pakaian ini.")}if(!q.ownedAccessories.includes(e)){let r=ha.find(o=>o.id===e);if(fa()>=r.xp)q.spentXP=(q.spentXP||0)+r.xp,q.ownedAccessories.push(e);else if(wi()>=r.coins)q.bank-=r.coins,q.ownedAccessories.push(e);else return Ze("XP atau Koin belum cukup untuk aksesoris ini.")}q.name=s,q.color=a,q.accessory=e,_o=a,bn(),vn(),Yt(),Ze("Avatar diperbarui.")}}B("profile").onclick=dh;function Zl(a,e,n){Yt(),Object.assign(me.player,{x:e,z:n,y:.6,vy:0}),me.obbyTriggered=!1,Ze("Tiba di "+a),ya()}function Ql(){let a=[["\u{1F333}","Alun-alun",0,12],["\u{1F331}","Kebun praktik",-17,-4.5],["\u{1F3E1}","Greenhouse",-18,-20],["\u{1F52C}","Laboratorium",0,-20],["\u{1F6CD}","Pasar desa",12,13],["\u{1F9F1}","Atelier kreatif",19,-10.2],["\u{1F6A9}","Jalur penjelajah",9,3],["\u{1F4A7}","Telaga teduh",-4,23]];kt(`<div class="tiny">Jelajahi dunia 01</div><h2 id="modaltitle">Ke mana kita pergi?</h2><p>Jalan kaki untuk menikmati dunia, atau gunakan perjalanan cepat di bawah ini.</p><div class="grid">${a.map(([e,n],i)=>`<div class="itemcard"><span class="big">${e}</span><strong>${n}</strong><button data-travel="${i}">Kunjungi \u2192</button></div>`).join("")}</div>`,!0),document.querySelectorAll("[data-travel]").forEach(e=>{let[n,i,s,r]=a[+e.dataset.travel];e.onclick=()=>Zl(i,s,r)})}B("navworld").onclick=Ql;B("minimap").onclick=Ql;function Hg(){kt('<div class="tiny">Atur pengalaman bermain</div><h2 id="modaltitle">Nyaman menjelajah.</h2><div class="settingsrow"><span>Profil & warna avatar</span><button id="setprofile">Atur</button></div><div class="settingsrow"><span>Grafis untuk HP ringan</span><button id="quality"></button></div><div class="settingsrow"><span>Suasana sore</span><button id="night"></button></div><div class="settingsrow"><span>Musik & efek suara</span><button id="audio"></button></div><div class="settingsrow"><span>Kembali ke titik awal</span><button id="respawn">Respawn</button></div><p>WASD / panah: bergerak. Spasi: lompat. Shift: berlari. E: berinteraksi. Angka 1\u20136: alat. Seret dunia untuk memutar kamera, gulir untuk mengatur jarak. Di HP gunakan joystick dan tombol layar.</p><a class="secondary-btn teacher-link" href="/guru" target="_top">Ruang guru \xB7 Laporan kelas \u2197</a><p class="smallnote">Game 3D mandiri bergaya dunia blok. Multiplayer memakai pembaruan posisi berkala; bukan bagian dari platform Roblox.</p>'),B("setprofile").onclick=dh;let a=()=>{B("quality").textContent=me.lowQuality?"Aktif":"Nonaktif",B("night").textContent=me.night?"Aktif":"Nonaktif",B("audio").textContent=ct.settings.music?"\u266B Aktif":"Atur"};a(),B("quality").onclick=()=>{me.setQuality(!me.lowQuality),a()},B("night").onclick=()=>{me.setNight(!me.night),B("daytime").textContent=me.night?"17:30 \u2022 Sore teduh":"08:30 \u2022 Cerah",a()},B("audio").onclick=()=>{oh=!oh,a(),ct.fx(/berhasil|selesai|tuntas/i.test(t)?"success":"click")},B("respawn").onclick=()=>{me.resetPosition(),Yt(),Ze("Kembali ke alun-alun.")}}B("settings").onclick=Hg;function Kl(a){if(!a?.crop)return"Petak kosong";let e=jt[a.crop],n=Date.now()+(me.serverOffset||0)-a.planted_at;if(!a.watered)return e.name+" \xB7 perlu air";if(!a.fed)return e.name+" \xB7 perlu kompos";if(n<e.duration){let i=Math.ceil((e.duration-n)/1e3),s=Math.floor(i/60),r=String(i%60).padStart(2,"0");return e.name+" \xB7 tumbuh "+s+":"+r}return e.name+" \xB7 siap panen"}function fh(a){if(!a||me.blocked){B("interact").hidden=!0;return}let e="";if(a.type==="plot"){let n=me.plotRecords.find(i=>i.slot===a.slot);e=Si==="seed"?"Tanam "+jt[Qn].name:Si==="water"?"Siram petak":Si==="feed"?"Beri kompos matang":Si==="harvest"?"Panen tanaman":Kl(n)+" \xB7 periksa"}else a.type==="build"?e=a.existing?"Ambil blok milikmu":"Pasang blok kreatif":a.type==="npc"?e="Bicara dengan Pak Tunas":a.type==="lab"?e="Belajar bersama Bu Flora":a.type==="shop"?e="Buka kios benih":a.type==="guard"&&(e="Bicara dengan Pak Satpam");B("interact").hidden=!e,B("interactlabel").textContent=e}function ph(a){let e=()=>{let n=me.plotRecords.find(i=>i.slot===a);B("modalbody").innerHTML=`<div class="tiny">Kebun praktik \xB7 Petak ${a+1}</div><h2 id="modaltitle">${n?.crop?jt[n.crop].emoji+" "+jt[n.crop].name:"\u{1F331} Lahan kecil, peluang besar."}</h2><p id="plantstatus"></p><p>${n?.crop?"Setiap teman di kelas bisa membantu merawat petak ini.":`Pilih benih dari ransel. Benih aktif: <b>${jt[Qn].name}</b>.`}</p>${n?.crop?`<div class="grid"><button class="option" id="waterplot">\u{1F4A7} ${n.watered?"\u2713 Sudah disiram":"Siram tanaman"}</button><button class="option" id="feedplot">\u{1F342} ${n.fed?"\u2713 Sudah diberi kompos":"Beri kompos matang"}</button></div><button class="primary" id="harvestplot">\u{1F9FA} Panen tanaman</button>`:'<button class="primary" id="plantplot">\u{1F331} Tanam benih aktif</button><button class="secondary-btn" id="changeseed">Pilih benih lain</button>'}<p id="plotowner" class="smallnote"></p><button class="secondary-btn" id="plotmaterial">\u{1F4DA} Pelajari budidaya petak ini</button><p class="smallnote">Waktu game dipercepat. Tanaman nyata membutuhkan waktu sesuai komoditas. Kebun kelas dibagikan ke semua siswa.</p>`,B("plotmaterial").onclick=()=>cs.open(n?.crop?n.watered?n.fed?"panen":"nutrisi":"air":"benih"),B("plantstatus").textContent=Kl(n),B("plotowner").textContent=n?.owner_name?"Ditanam oleh "+n.owner_name:"",n?.crop?(B("waterplot").disabled=!!n.watered,B("feedplot").disabled=!!n.fed,B("waterplot").onclick=()=>rs("water",a,!0),B("feedplot").onclick=()=>rs("feed",a,!0),B("harvestplot").onclick=()=>rs("harvest",a,!0)):(B("plantplot").onclick=()=>rs("plant",a,!0),B("changeseed").onclick=hh)};kt('<h2 id="modaltitle">Petak kebun</h2>'),e(),xo=setInterval(()=>{B("plantstatus")&&(B("plantstatus").textContent=Kl(me.plotRecords.find(n=>n.slot===a)))},1e3)}async function rs(a,e,n=!1){if(!da){da=!0;try{if($e){await ei();let i=await Ti("action",{room:$e.room,action:a,slot:e,crop:Qn},$e.token);Ze(i.message),await ei()}else{let i=q.soloPlots.find(s=>s.slot===e);if(i||(i={slot:e,crop:"",watered:0,fed:0,planted_at:0,owner_name:q.name},q.soloPlots.push(i)),a==="plant"){if(i.crop)throw Error("Petak sudah terisi. Rawat atau panen tanaman dahulu.");Object.assign(i,{crop:Qn,planted_at:Date.now(),watered:0,fed:0,owner_name:q.name})}else if(i.crop){if(a==="water"){if(i.watered)throw Error("Tanaman sudah disiram.");i.watered=1}else if(a==="feed"){if(i.fed)throw Error("Kompos sudah diberikan.");i.fed=1}else if(a==="harvest"){if(!i.watered||!i.fed||Date.now()-i.planted_at<jt[i.crop].duration)throw Error("Tanaman belum siap. Siram, beri kompos, lalu tunggu cukup umur.");i.crop="",q.bank+=25,q.farmXP+=40,q.harvested++}}else throw Error("Tanam benih dahulu pada petak kosong.");me.setRecords(q.soloPlots,q.soloBuilds,Date.now()),Ze({plant:"Benih ditanam. Sekarang siram dan beri kompos.",water:"Air secukupnya membantu akar tumbuh.",feed:"Kompos matang membantu memperbaiki media.",harvest:"Panen berhasil! +40 XP dan +25 koin."}[a])}q.flags[a]=!0,bn(),vn(),n&&ph(e)}catch(i){Ze(i.message)}finally{da=!1}}}async function Vg(a){if(!da){da=!0;try{if($e){await ei();let e=await Ti("action",{room:$e.room,action:a.existing?"remove":"build",id:a.existing?.id,x:a.x,z:a.z,color:_o},$e.token);Ze(e.message),await ei()}else{if(a.existing)q.soloBuilds=q.soloBuilds.filter(e=>e.id!==a.existing.id);else{if(q.soloBuilds.length>=64)throw Error("Batas latihan: 64 blok. Ambil blok lama terlebih dahulu.");q.soloBuilds.push({id:crypto.randomUUID(),player_id:"solo",x:a.x,z:a.z,color:_o})}bn(),me.setRecords(q.soloPlots,q.soloBuilds,Date.now()),Ze(a.existing?"Blok diambil kembali.":"Blok berhasil dipasang.")}}catch(e){Ze(e.message)}finally{da=!1}}}function mh(){if(me.blocked)return;ya();let a=me.nearest();if(!a){Si==="build"&&Ze("Dekati area Atelier Kreatif di sisi timur laut.");return}if(a.type==="npc")kt('<div class="tiny">Pak Tunas \xB7 Pembimbing kebun</div><h2 id="modaltitle">Halo, penjelajah muda! \u{1F33F}</h2><p>Kebun yang sehat dimulai dari kebiasaan yang baik. Kenakan APD sesuai risiko, periksa alatmu, lalu kenali kebutuhan tanaman. Setelah belajar K3, pergilah ke kebun di barat laut untuk memulai praktik.</p><button class="primary" id="talklesson">Belajar K3 \u2192</button><button class="secondary-btn" id="talkmissions">Lihat semua misi</button><button class="secondary-btn" id="talkmaterials">Buka perpustakaan materi \u2192</button>'),B("talklesson").onclick=()=>bo(0),B("talkmissions").onclick=Jl,B("talkmaterials").onclick=()=>cs.library();else if(a.type==="lab")cs.library("Laboratorium");else if(a.type==="shop")Jn();else if(a.type==="guard")kt('<div class="tiny">Pos Satpam \xB7 Gerbang Utama</div><h2 id="modaltitle">Selamat datang di Lembah Tunas! \u{1F46E}</h2><p>Saya Pak Satpam yang bertugas menjaga gerbang utama area praktik ATPH. Pastikan kamu mematuhi aturan keselamatan (K3), menjaga kebersihan kebun, dan merawat tanaman dengan penuh tanggung jawab.</p><button class="primary" id="guardk3">Pelajari aturan K3 \u2192</button><button class="secondary-btn" id="guardmap">Lihat peta area \u2192</button>'),B("guardk3").onclick=()=>bo(0),B("guardmap").onclick=Ql;else if(a.type==="plot"){let e={seed:"plant",water:"water",feed:"feed",harvest:"harvest"}[Si];e?rs(e,a.slot):ph(a.slot)}else a.type==="build"&&Vg(a)}B("interact").onclick=mh;function Gg(){if(q.flags.obby){Ze("Bendera berhasil dicapai lagi. Hebat!");return}kt('<div class="tiny">Puncak jalur penjelajah</div><h2 id="modaltitle">Lompatanmu membawa ilmu! \u{1F6A9}</h2><p>Sebelum menerima lencana, jawab satu tantangan: bagaimana cara paling tepat menyiram bibit muda?</p><button class="option" id="obbywrong">Menggunakan semburan air sangat kuat</button><button class="option" id="obbyright">Menyiram lembut sesuai kebutuhan media</button><p id="obbyfeedback"></p>'),B("obbywrong").onclick=()=>{B("obbyfeedback").textContent="Coba lagi. Semburan kuat dapat merusak bibit dan menggeser media."},B("obbyright").onclick=()=>{q.flags.obby=!0,q.journal.push({mission:2,date:new Date().toLocaleDateString("id-ID"),text:"Penyiraman bibit dilakukan dengan lembut sesuai kebutuhan media, agar bibit dan akar tidak rusak."}),bn(),vn(),Yt(),Ze("Lencana Penjelajah Tangguh! +100 XP, +50 koin.")}}function ya(){B("zonetitle").style.opacity="0"}function Wg(a){B("zonename").textContent=a,B("learnnear").textContent="\u{1F4D6} Materi: "+a,ya(),Ze("\u25C8 "+a)}function gh(){if(!Yl)return;let a=document.createElement("div");a.className="tutorial",a.id="intro",a.innerHTML='<section><div class="tiny">SELAMAT DATANG DI AGROQUEST WORLDS</div><h1>Satu dunia.<br>Banyak <span>petualangan.</span></h1><p>Jelajahi kebun, tumbuhkan kehidupan, dan temukan teman belajarmu. Dunia ini menunggumu.</p><button id="beginadventure">Mulai menjelajah &nbsp; \u2197</button><div class="mini">WASD untuk bergerak \xB7 Spasi untuk melompat<br>Seret layar untuk melihat sekeliling.<br>Di HP, gunakan joystick dan tombol \u2191.</div></section>',document.body.append(a),me.blocked=!0,B("beginadventure").onclick=()=>{a.remove(),me.blocked=!1,Yl=!1,localStorage.setItem("agroquest-worlds-intro","1"),B("world").focus(),Ze("Temui Pak Tunas di dekat alun-alun. Atau buka Misi untuk mulai belajar.")}}window.addEventListener("keydown",a=>{if(a.key==="Escape"){Yt();return}if(a.key==="Tab"&&B("overlay").classList.contains("open")){let e=[...B("overlay").querySelectorAll("button:not(:disabled):not([hidden]),input,select,textarea,a[href]")],n=e[0],i=e[e.length-1];a.shiftKey&&document.activeElement===n?(a.preventDefault(),i.focus()):!a.shiftKey&&document.activeElement===i&&(a.preventDefault(),n.focus());return}/INPUT|TEXTAREA|SELECT/.test(a.target.tagName)||me?.blocked||(a.key.toLowerCase()==="e"&&!a.repeat&&(a.preventDefault(),mh()),/^[1-6]$/.test(a.key)&&So(ch[Number(a.key)-1][0]),["w","a","s","d","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(a.key)&&ya())});B("jump").onpointerdown=a=>{a.preventDefault(),me.jump(),ya()};B("wave").onclick=()=>{jl=!0,me.waveUntil=Date.now()+3e3,Ze("\u{1F44B} Halo, teman penjelajah!")};var vo=null,ma=B("joystick"),yh=B("stick");function xh(a){let e=ma.getBoundingClientRect(),n=a.clientX-(e.left+e.width/2),i=a.clientY-(e.top+e.height/2),s=Math.hypot(n,i),r=e.width*.31;s>r&&(n=n/s*r,i=i/s*r),yh.style.transform=`translate(${n}px,${i}px)`,me.setJoystick(n/r,i/r),ya()}ma.onpointerdown=a=>{a.preventDefault(),vo=a.pointerId,ma.setPointerCapture(vo),xh(a)};ma.onpointermove=a=>{a.pointerId===vo&&xh(a)};ma.onpointerup=ma.onpointercancel=()=>{vo=null,yh.style.transform="",me.setJoystick(0,0)};if($e&&!$e.learnerId){$e=null;try{sessionStorage.removeItem("agroquest-room")}catch{}}function us(){try{$e?sessionStorage.setItem("agroquest-room",JSON.stringify($e)):sessionStorage.removeItem("agroquest-room")}catch{}}async function Ti(a,e={},n){let i=new AbortController,s=setTimeout(()=>i.abort(),1e4);try{let r=await fetch("/api/rooms/"+a,{method:"POST",headers:{"Content-Type":"application/json",...n?{Authorization:"Bearer "+n}:{}},body:JSON.stringify(e),signal:i.signal}),o;try{o=await r.json()}catch{throw Error("Respons server tidak valid. Coba kembali.")}if(!r.ok){let l=Error(o.error||"Permintaan gagal.");throw l.status=r.status,l}return o}finally{clearTimeout(s)}}function ga(a){let e=!!$e;B("roomjoin").hidden=e,B("roomcreate").hidden=e,B("roommembers").hidden=!e,B("roomstatus").textContent=e?"\u25C9 Kelas "+$e.room:"\u25C9 Bertemu teman sekelas",B("roomdetail").textContent=e?a===void 0?"Menghubungkan dunia bersama\u2026":a+" / 36 pemain \xB7 Kebun bersama":"Mode solo \xB7 Kelas bersama hingga 36 pemain.",B("roommembers").textContent=(a||0)+" / 36 pemain \xB7 Lihat kelas"}function wo(a=""){if($e)return ec();kt('<div class="tiny">Multiplayer \xB7 Kelas bersama</div><h2 id="modaltitle">Bertemu di satu dunia.</h2><p>Masukkan nama panggilan dan kode dari guru. Kalian bisa bertemu, saling menyapa, merawat kebun, dan membangun bersama.</p><label for="roomname">Nama panggilan</label><input id="roomname" maxlength="25" autocomplete="off"><label for="roominput">Kode kelas</label><input id="roominput" maxlength="10" autocomplete="off" placeholder="10 karakter" style="text-transform:uppercase"><p id="roomerror" class="error" role="alert"></p><button class="primary" id="joinnow">Masuk ke dunia bersama \u2192</button><p class="smallnote">Pakai nama panggilan; tidak perlu email atau nomor telepon. Maksimal 36 pemain total.</p>'),B("roomname").value=q.name,B("roominput").value=a,B("joinnow").onclick=async()=>{let e=B("joinnow");e.disabled=!0,e.textContent="Menghubungkan\u2026";try{let n=B("roomname").value.trim(),i=await Ti("join",{room:B("roominput").value.trim().toUpperCase(),name:n,color:q.color,learnerToken:localStorage.getItem("agroquest-learner")});$e=i,Zn.joined(i),q.name=n,bn(),us(),me.setPeers([],i.id,Date.now()),me.setRecords([],[],Date.now()),me.resetPosition(),vn(),ga(),Yt(),clearTimeout(ls),ei().catch(()=>{}).finally(tc),Ze("Berhasil masuk. Kebun dan bangunan kini dibagikan ke kelas.")}catch(n){B("roomerror")&&(B("roomerror").textContent=n.name==="AbortError"?"Koneksi terlalu lama. Coba kembali.":n.message),e.isConnected&&(e.disabled=!1,e.textContent="Masuk ke dunia bersama \u2192")}}}B("roomjoin").onclick=()=>wo();B("roomcreate").onclick=async()=>{let a=B("roomcreate");a.disabled=!0;try{let e=await Ti("create");kt('<div class="tiny">Dunia bersama berhasil dibuat</div><h2 id="modaltitle">Satu kelas. Satu petualangan.</h2><p>Bagikan tautan game ini dan kode berikut kepada siswa. Gunakan kode yang sama agar bertemu di dunia yang sama.</p><div class="roomcode" id="newroomcode"></div><button class="primary" id="entercreated">Masuk ke kelas ini \u2192</button><button class="secondary-btn" id="copyinvite">Salin tautan & kode</button><p class="smallnote">36 slot untuk seluruh pemain. Guru yang ikut masuk memakai satu slot. Bagikan kode hanya kepada kelas.</p>'),B("newroomcode").textContent=e.room,B("entercreated").onclick=()=>wo(e.room),B("copyinvite").onclick=async()=>{try{await navigator.clipboard.writeText("AgroQuest Worlds: "+location.origin+"/#kelas="+e.room+" | Kode "+e.room),Ze("Tautan & kode disalin")}catch{Ze("Kode kelas: "+e.room)}}}catch(e){Ze(e.name==="AbortError"?"Koneksi terlalu lama. Coba kembali.":e.message)}finally{a.disabled=!1}};function ec(){if(!$e)return wo();kt('<div class="tiny">Dunia kelas bersama</div><h2 id="modaltitle">Teman satu petualangan.</h2><div class="roomcode" id="membercode"></div><div class="row"><p id="membercount"></p><span class="muted">Maks. 36 pemain</span></div><div id="memberlist"></div><button class="secondary-btn" id="refreshmembers">Perbarui daftar</button><button class="secondary-btn" id="leaveclass">Keluar dari kelas</button><p id="leaveerror" class="error"></p><p class="smallnote">Kebun dan blok adalah milik ruang kelas ini. Pemain offline hilang setelah sekitar 35 detik. Nilai panen sesi disinkronkan; progres kuis tetap di perangkat.</p>'),B("membercode").textContent=$e.room,B("membercount").textContent=os.length+" pemain online";for(let a of os){let e=document.createElement("div");e.className="settingsrow";let n=document.createElement("strong");n.style.fontSize="12px",n.textContent=a.name+(a.id===$e.id?" (kamu)":"");let i=document.createElement("span");i.className="muted",i.textContent=(a.harvests||0)+" panen",e.append(n,i),B("memberlist").append(e)}B("refreshmembers").onclick=()=>ei().then(ec).catch(a=>Ze(a.message)),B("leaveclass").onclick=async()=>{let a=B("leaveclass");a.disabled=!0;try{await Zn.flush(),await Ti("leave",{room:$e.room},$e.token),$e=null,Zn.left(),us(),clearTimeout(ls),os=[],me.setPeers([],null,Date.now()),me.setRecords(q.soloPlots,q.soloBuilds,Date.now()),ga(),Yt(),Ze("Kembali ke mode solo. Progres belajar tetap tersimpan.")}catch{B("leaveerror").textContent="Belum dapat keluar. Periksa koneksi lalu coba lagi.",a.disabled=!1}}}B("roommembers").onclick=ec;function Xg(a){if(!a)return;let e=q.earnings[a.id]||{xp:0,coins:0,harvests:0},n=Math.max(0,(a.farm_coins||0)-e.coins),i=Math.max(0,(a.farm_xp||0)-e.xp),s=Math.max(0,(a.harvests||0)-e.harvests);(n||i||s)&&(q.bank+=n,q.farmXP+=i,q.harvested+=s,q.earnings[a.id]={coins:a.farm_coins||0,xp:a.farm_xp||0,harvests:a.harvests||0},bn(),vn())}var ss=null;async function ei(){if(!$e)return;if(ss)return ss;let a=$e;return ss=(async()=>{try{let e=me.player,n=await Ti("sync",{room:a.room,x:e.x/6+6,y:e.z/6+6,elevation:e.y,yaw:e.yaw,moving:e.moving,color:q.color,wave:jl},a.token);if($e!==a)return;jl=!1,os=n.players,rh=Date.now(),Og=n.serverTime,me.setPeers(n.players,a.id,n.serverTime),me.setRecords(n.plots,n.builds,n.serverTime),Xg(n.players.find(i=>i.id===a.id)),ga(n.players.length)}catch(e){if($e!==a)return;throw e.status===401||e.status===410?($e=null,Zn?.left(),us(),me.setPeers([],null,Date.now()),me.setRecords(q.soloPlots,q.soloBuilds,Date.now()),ga(),Ze(e.message)):(B("roomdetail").textContent="Koneksi terputus \xB7 mencoba kembali\u2026",Date.now()-rh>5e3&&me.setPeers([],null,Date.now())),e}finally{ss=null}})(),ss}function tc(){clearTimeout(ls),$e&&(ls=setTimeout(()=>ei().catch(()=>{}).finally(tc),document.hidden?7e3:1e3+Math.random()*200))}Zn=lc({state:q,getSession:()=>$e,rememberRoom:us,restore:qg,renderHUD:vn});var cs=uc({state:q,save:bn,modal:kt,toast:Ze,travel:Zl,game:()=>me,renderHUD:vn});try{if(me=new yo(B("world"),{onInteract:fh,onZone:Wg,onObby:Gg,onJump:()=>ct.fx("jump")}),window.agroReady=!0,vn(),me.setRecords(q.soloPlots,q.soloBuilds,Date.now()),ga(),B("loader").style.display="none",innerWidth<700&&(me.zoom=12.5),matchMedia("(pointer:coarse)").matches&&me.setQuality(!0),gh(),$e)ei().catch(()=>{}).finally(tc);else{let a=new URLSearchParams(location.hash.slice(1)).get("kelas");a&&/^[A-F0-9]{10}$/i.test(a)&&(document.getElementById("intro")?.remove(),me.blocked=!1,wo(a.toUpperCase()))}}catch(a){B("loadtext").textContent="Dunia 3D belum berhasil dimuat.",B("loaderror").style.display="block",B("loaderror").textContent="Aktifkan WebGL atau coba browser lain. "+a.message,console.error(a)}function qg(a){q.completed=Array.from(new Set([...q.completed,...a.completed||[]])),q.learning=q.learning||{};for(let[e,n]of Object.entries(a.learning||{})){let i=q.learning[e]||{};q.learning[e]={...n,...i,read:!!(n.read||i.read),best:Math.max(n.best||0,i.best||0),attempts:Math.max(n.attempts||0,i.attempts||0),rewarded:!!(i.rewarded||n.best>=2),tasks:Array.from({length:4},(s,r)=>!!(n.tasks?.[r]||i.tasks?.[r])),reflection:i.reflection||n.reflection||""}}q.farmXP=Math.max(q.farmXP,(a.xp||0)-q.completed.length*100-(q.flags.obby?100:0)),q.harvested=Math.max(q.harvested,a.harvested||0),bn()}function jg(){kt('<div class="tiny">Suasana petualangan</div><h2 id="modaltitle">Musik & efek suara \u266B</h2><p>Musik instrumental lembut menemani permainan. Atur musik dan efek secara terpisah. Suara dijeda saat tab tidak terlihat.</p><div class="settingsrow"><span>Musik latar</span><button id="musicenabled"></button></div><label for="musicvolume">Volume musik</label><input id="musicvolume" type="range" min="0" max="100"><div class="settingsrow"><span>Efek aksi & hadiah</span><button id="fxenabled"></button></div><label for="fxvolume">Volume efek</label><input id="fxvolume" type="range" min="0" max="100"><p id="audiostatus" role="status"></p><button class="primary" id="muteall">Bisukan semua suara</button>');let a=()=>{B("musicenabled")&&(B("musicenabled").textContent=ct.settings.music?"Aktif":"Mati",B("fxenabled").textContent=ct.settings.effects?"Aktif":"Mati",B("musicvolume").value=Math.round(ct.settings.musicVolume*100),B("fxvolume").value=Math.round(ct.settings.effectsVolume*100),B("audiostatus").textContent=ct.status(),B("muteall").textContent=ct.settings.music||ct.settings.effects?"Bisukan semua suara":"Aktifkan musik & efek")};a(),ct.onChange=()=>{a(),B("soundbutton").textContent=ct.settings.music?"\u266B":"\u266A"},B("musicenabled").onclick=()=>ct.update({music:!ct.settings.music}),B("fxenabled").onclick=()=>{ct.update({effects:!ct.settings.effects}),ct.fx("success")},B("musicvolume").oninput=e=>ct.update({musicVolume:Number(e.target.value)/100}),B("fxvolume").oninput=e=>ct.update({effectsVolume:Number(e.target.value)/100}),B("muteall").onclick=()=>{let e=!(ct.settings.music||ct.settings.effects);ct.update({music:e,effects:e})}}B("soundbutton").onclick=jg;ct.onChange=()=>{B("soundbutton").textContent=ct.settings.music?"\u266B":"\u266A"};(function(){let e=B("logoutbtn"),n=B("logoutmodal"),i=B("logoutcancel"),s=B("logoutconfirm"),r=B("exitscreen"),o=B("exitreenter");if(!e||!n||!i||!s||!r||!o)return;function l(){if(B("intro")){e.hidden=!0;let g=B("beginadventure");g&&!g.dataset.logoutBound&&(g.dataset.logoutBound="1",g.addEventListener("click",()=>{e.hidden=!1}))}else e.hidden=!r.hidden}function u(){n.hidden=!1,me&&(me.blocked=!0,me.keys={},me.setJoystick(0,0)),i.focus()}function c(){n.hidden=!0,me&&!B("overlay").classList.contains("open")&&!B("intro")&&r.hidden&&(me.blocked=!1)}async function h(){if(s.disabled=!0,n.hidden=!0,B("overlay").classList.contains("open")&&Yt(),e.hidden=!0,ct.pause(),me&&(me.blocked=!0,me.keys={},me.setJoystick(0,0)),$e){let p=$e;try{await Zn?.flush()}catch{}try{await Ti("leave",{room:p.room},p.token)}catch{}$e=null,Zn?.left(),us(),clearTimeout(ls),os=[],me?.setPeers([],null,Date.now()),me?.setRecords(q.soloPlots,q.soloBuilds,Date.now()),ga()}B("exitstudentname").textContent=q.name||"Petani Muda",B("exitstudentrole").textContent="Level "+(1+Math.floor(pa()/200))+" \xB7 Penjelajah ATPH",B("exitxp").textContent=pa()+" XP",B("exitharvests").textContent=(q.harvested||0)+" Panen",r.hidden=!1,s.disabled=!1,o.focus()}function f(){r.hidden=!0,B("intro")?.remove(),Yl=!0,gh(),l()}e.onclick=u,i.onclick=c,s.onclick=h,o.onclick=f,n.addEventListener("click",p=>{p.target===n&&c()}),window.addEventListener("keydown",p=>{p.key==="Escape"&&!n.hidden&&c()}),l()})();
