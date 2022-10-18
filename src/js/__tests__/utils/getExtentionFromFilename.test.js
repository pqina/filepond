import {getExtensionFromFilename} from '../../utils/getExtensionFromFilename'
describe("getExtensionFromFilename",()=>{
    test.each([
        ['a.pdf','pdf'],
        ['a.module.js','js'],
        ['a',''],
    ])("should return exact extention name", (filename,expectedExtention) => {
        expect(getExtensionFromFilename(filename)).toBe(expectedExtention)
    })
})