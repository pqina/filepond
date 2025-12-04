import { getImageSize, getVideoSize } from '../../src/utils/media.js';

async function getImageSizeFromURL(image) {
    const blob = await fetch(`./assets/images/${image}`).then((res) => res.blob());
    return await getImageSize(blob);
}

async function getVideoSizeFromURL(video) {
    const blob = await fetch(`./assets/videos/${video}`).then((res) => res.blob());
    return await getVideoSize(blob);
}

describe('media', () => {
    describe('getImageSize', () => {
        it('should correctly read size of JPGs', async () => {
            const size = await getImageSizeFromURL('1050_700.jpg');
            expect(size.width).to.equal(1050);
            expect(size.height).to.equal(700);
        });

        it('should correctly read size of PNGs', async () => {
            const size = await getImageSizeFromURL('850_566.png');
            expect(size.width).to.equal(850);
            expect(size.height).to.equal(566);
        });

        it('should correctly read size of GIFs', async () => {
            const size = await getImageSizeFromURL('1900_1267.gif');
            expect(size.width).to.equal(1900);
            expect(size.height).to.equal(1267);
        });

        it('should correctly read size of WEBPs', async () => {
            const size = await getImageSizeFromURL('1050_700.webp');
            expect(size.width).to.equal(1050);
            expect(size.height).to.equal(700);
        });

        it('should correctly read size of AVIFs', async () => {
            const size = await getImageSizeFromURL('630_420.avif');
            expect(size.width).to.equal(630);
            expect(size.height).to.equal(420);
        });

        it('should correctly read size of HEICs', async () => {
            const size = await getImageSizeFromURL('1440_960.heic');
            expect(size.width).to.equal(1440);
            expect(size.height).to.equal(960);
        });
    });

    describe('getVideoSize', () => {
        it('should correctly read size of MP4s', async () => {
            const size = await getVideoSizeFromURL('1920_1080.mp4');
            expect(size.width).to.equal(1920);
            expect(size.height).to.equal(1080);
        });
    });
});
