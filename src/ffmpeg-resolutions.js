export default [
  {
    names: ['360p'],
    width: 640,
    height: 360,
    profile: 'main',
    hlsTime: '4',
    bv: '800k',
    maxrate: '856k',
    bufsize: '1200k',
    ba: '96k',
    ts_title: '360p',
    master_title: '360p',
    h264: '-c:v libx264 -crf 23 -b:v 500k -bufsize 1000k -maxrate 600k'.split(
      ' '
    ),
    h264_nvenc:
      '-c:v h264_nvenc -preset slow -qmin 16 -qmax 28 -cq 18 -b:v 500k -pix_fmt nv12'.split(
        ' '
      ),
    h264_videotoolbox:
      '-c:v h264_videotoolbox -b:v 500k -maxrate:v 500k -bufsize:v 1000k -profile:v main -pix_fmt yuv420p -level:v 3.1'.split(
        ' '
      ),
    h264_qsv:
      '-c:v h264_qsv -b:v 500k -maxrate:v 500k -bufsize:v 1000k -quality 21 -pix_fmt nv12'.split(
        ' '
      ),
    h264_vaapi:
      '-c:v h264_vaapi -b:v 500k -maxrate:v 500k -bufsize:v 1000k -profile:v main -pix_fmt yuv420p -level:v 3.1'.split(
        ' '
      ),
    h264_dxva2:
      '-c:v h264_dxva2 -b:v 500k -maxrate:v 500k -bufsize:v 1000k -profile:v main -pix_fmt yuv420p -level:v 3.1'.split(
        ' '
      ),
    h264_amf:
      '-c:v h264_amf -qp 26 -b:v 500k -bufsize 1000k -maxrate 600k'.split(' '),
    h264_omx: '-c:v h264_omx -b:v 500k -maxrate 500k -bufsize 1000k'.split(' '),
  },
  {
    names: ['480p'],
    width: 842,
    height: 480,
    profile: 'main',
    hlsTime: '4',
    bv: '1400k',
    maxrate: '1498',
    bufsize: '2100k',
    ba: '128k',
    ts_title: '480p',
    master_title: '480p',
    h264: '-c:v libx264 -crf 22 -b:v 1000k -bufsize 2000k -maxrate 1200k'.split(
      ' '
    ),
    h264_nvenc:
      '-c:v h264_nvenc -preset slow -qmin 16 -qmax 28 -cq 18 -b:v 1000k -pix_fmt nv12'.split(
        ' '
      ),
    h264_qsv:
      '-c:v h264_qsv -b:v 1000k -maxrate:v 1000k -bufsize:v 2000k -quality 23 -pix_fmt nv12'.split(
        ' '
      ),
    h264_videotoolbox:
      '-c:v h264_videotoolbox -b:v 1000k -maxrate:v 1000k -bufsize:v 2000k -profile:v main -pix_fmt yuv420p -level:v 3.1'.split(
        ' '
      ),
    h264_vaapi:
      '-c:v h264_vaapi -b:v 1000k -maxrate:v 1000k -bufsize:v 2000k -profile:v main -pix_fmt yuv420p -level:v 3.1'.split(
        ' '
      ),
    h264_dxva2:
      '-c:v h264_dxva2 -b:v 1000k -maxrate:v 1000k -bufsize:v 2000k -profile:v main -pix_fmt yuv420p -level:v 3.1'.split(
        ' '
      ),
    h264_amf:
      '-c:v h264_amf -qp 24 -b:v 1000k -bufsize 2000k -maxrate 1200k'.split(
        ' '
      ),
    h264_omx: '-c:v h264_omx -b:v 750k -maxrate 750k -bufsize 1500k'.split(' '),
  },
  {
    names: ['720p', 'HDREADY'],
    width: 1280,
    height: 720,
    profile: 'main',
    hlsTime: '4',
    bv: '2800k',
    maxrate: '2996k',
    bufsize: '4200k',
    ba: '128k',
    ts_title: '720p',
    master_title: '720p',
    h264: '-c:v libx264 -crf 21 -b:v 3000k -bufsize 6000k -maxrate 4000k'.split(
      ' '
    ),
    h264_nvenc:
      '-c:v h264_nvenc -preset slow -qmin 16 -qmax 28 -cq 18 -b:v 3000k -pix_fmt nv12'.split(
        ' '
      ),
    h264_qsv:
      '-c:v h264_qsv -b:v 3000k -maxrate:v 4000k -bufsize:v 6000k -quality 25 -pix_fmt nv12'.split(
        ' '
      ),
    h264_videotoolbox:
      '-c:v h264_videotoolbox -b:v 3000k -maxrate:v 4000k -bufsize:v 6000k -profile:v main -pix_fmt yuv420p -level:v 4.0'.split(
        ' '
      ),
    h264_vaapi:
      '-c:v h264_vaapi -b:v 3000k -maxrate:v 4000k -bufsize:v 6000k -profile:v main -pix_fmt yuv420p -level:v 4.0'.split(
        ' '
      ),
    h264_dxva2:
      '-c:v h264_dxva2 3000k -maxrate:v 4000k -bufsize:v 6000k -profile:v main -pix_fmt yuv420p -level:v 4.0'.split(
        ' '
      ),
    h264_amf:
      '-c:v h264_amf -qp 22 -b:v 3000k -bufsize 6000k -maxrate 4000k'.split(
        ' '
      ),
    h264_omx: '-c:v h264_omx -b:v 3000k -maxrate 4000k -bufsize 6000k'.split(
      ' '
    ),
  },
  {
    names: ['1080p', 'FULLHD'],
    width: 1920,
    height: 1080,
    profile: 'main',
    hlsTime: '4',
    bv: '5000k',
    maxrate: '5350k',
    bufsize: '7500k',
    ba: '192k',
    ts_title: '1080p',
    master_title: '1080p',
    h264: '-c:v libx264 -crf 20 -b:v 4000k -bufsize 8000k -maxrate 4800k'.split(
      ' '
    ),
    h264_nvenc:
      '-c:v h264_nvenc -preset slow -qmin 16 -qmax 28 -cq 18 -b:v 4000k -pix_fmt nv12'.split(
        ' '
      ),
    h264_qsv:
      '-c:v h264_qsv -b:v 4000k -maxrate:v 4000k -bufsize:v 8000k -quality 27 -pix_fmt nv12'.split(
        ' '
      ),
    h264_videotoolbox:
      '-c:v h264_videotoolbox -b:v 4000k -maxrate:v 4000k -bufsize:v 8000k -profile:v main -pix_fmt yuv420p -level:v 4.0'.split(
        ' '
      ),
    h264_vaapi:
      '-c:v h264_vaapi -b:v 4000k -maxrate:v 4000k -bufsize:v 8000k -profile:v main -pix_fmt yuv420p -level:v 4.0'.split(
        ' '
      ),
    h264_dxva2:
      '-c:v h264_dxva2 -b:v 4000k -maxrate:v 4000k -bufsize:v 8000k -profile:v main -pix_fmt yuv420p -level:v 4.0'.split(
        ' '
      ),
    h264_amf:
      '-c:v h264_amf -qp 20 -b:v 4000k -bufsize 8000k -maxrate 4800k'.split(
        ' '
      ),
    h264_omx: '-c:v h264_omx -b:v 4000k -maxrate 4000k -bufsize 8000k'.split(
      ' '
    ),
  },
  {
    names: ['FULLHDMAX'],
    width: 1920,
    height: 1080,
    profile: 'main',
    hlsTime: '4',
    bv: '5000k',
    maxrate: '5350k',
    bufsize: '7500k',
    ba: '192k',
    ts_title: '1080p',
    master_title: '1080p',
    h264: '-c:v libx264 -crf 20 -b:v 8000k -bufsize 8000k -maxrate 4800k'.split(
      ' '
    ),
    h264_nvenc:
      '-c:v h264_nvenc -preset slow -qmin 16 -qmax 28 -cq 18 -b:v 4000k -pix_fmt nv12'.split(
        ' '
      ),
    h264_qsv:
      '-c:v h264_qsv -b:v 4000k -maxrate:v 4000k -bufsize:v 8000k -quality 29 -pix_fmt nv12'.split(
        ' '
      ),
    h264_videotoolbox:
      '-c:v h264_videotoolbox -b:v 8000k -maxrate:v 8000k -bufsize:v 8000k -profile:v main -pix_fmt yuv420p -level:v 4.0'.split(
        ' '
      ),
    h264_vaapi:
      '-c:v h264_vaapi -b:v 8000k -maxrate:v 8000k -bufsize:v 8000k -profile:v main -pix_fmt yuv420p -level:v 4.0'.split(
        ' '
      ),
    h264_dxva2:
      '-c:v h264_dxva2 -b:v 8000k -maxrate:v 8000k -bufsize:v 8000k -profile:v main -pix_fmt yuv420p -level:v 4.0'.split(
        ' '
      ),
    h264_amf:
      '-c:v h264_amf -qp 20 -b:v 8000k -bufsize 8000k -maxrate 4800k'.split(
        ' '
      ),
    h264_omx: '-c:v h264_omx -b:v 8000k -maxrate 8000k -bufsize 8000k'.split(
      ' '
    ),
  },
];
