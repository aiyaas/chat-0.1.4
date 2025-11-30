async function environment(msg) {
  // Simpan riwayat pesan dan data file
  data.message = msg; 
  
  // Push data ke chat session, untuk riwayat percakapan sebelumnya
  data.history.push({
    role: 'user',
    parts: [
      { text: data.message },
      // Tambahkan inline_data jika ada data file
      ...(data.file?.data ? [{ inline_data: (({ fileName, isImage, ...rest }) => rest)(data.file) }] : [])
    ]
  });
  
  try {
    const model = "gemini-2.5-flash";
    const youtubeRegex = /\b(yt|youtube)\b/i;
    
    // Check if the user requested a video search      
    if (youtubeRegex.test(msg)) {
      // Jika terdeteksi kata kunci YouTube
      const ytAuth = await (await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${msg}&key=AIzaSyCRzpbNMkmCOcVy1VCiHjiNzdqYnWvN2ec`)).json();
      
      // Kembalikan iframe YouTube dan deskripsi
      const videoId = ytAuth.items?.[0]?.id?.videoId;
      const description = ytAuth.items?.[0]?.snippet?.description;
      
      if (videoId) {
        // Jika video ditemukan
        const response = `<iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe><br /><small>${description || 'Tidak ada deskripsi.'}</small>`;
        
        // Simpan respons model ke riwayat
        data.history.push({
          role: 'model',
          parts: [{ text: response }]
        });
        return response;
      } else {
        // Jika video tidak ditemukan, beri respons ke user
        const notFoundResponse = "Maaf, tidak dapat menemukan video YouTube yang relevan dengan permintaan Anda.";
        
        // Simpan respons model ke riwayat
        data.history.push({
          role: 'model',
          parts: [{ text: notFoundResponse }]
        });
        return useMarkUpText(notFoundResponse);
      }
      
    } else {
      // Jika bukan pencarian YouTube, kirim ke API Chat
      const request = await (await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': 'AIzaSyCAwVz1pF43-8pLvPzJysh2NfM4-2YQ6oo'
          },
          body: JSON.stringify({
            'system_instruction': {
              'parts': [{
                'text': 'You are a code assistant who has the capacity in the programming world to talk to ID, EN, ETC. Your main special roles are (Development) and (All) roles. Your name is Reapl!'
              }]
            },
            'contents': data?.history
          }),
          signal: new AbortController().signal
        }))
        .json(); // Ambil data dengan tipe objek
      
      const response = request ? request?.candidates?.[0]?.content?.parts?.[0]?.text.replace(/<(.*?)>/gis, '&#60;$1&#62;') : request?.error?.message; // Proses teks respons
      
      // Tambahkan data dengan role (model) type 
      data.history.push({
        role: 'model',
        parts: [{ text: response }]
      });

      return useMarkUpText(response);
    }
    
  } catch (e) {
    console.error(e.stack);
    return `Terjadi kesalahan: ${e.message}`;
  } finally {
    data.file = {}; // Reset data file setelah respons dari model 
  }
}