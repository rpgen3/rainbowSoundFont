class Node {
    constructor() {
        this.children = [];
    }
}

const endOf = array => array[array.length - 1];
const parseAttributes = str => str.match(/[^ ]+=".+?"/g)?.map(v => v.split('=')).map(([a, b]) => [a, b.slice(1, -1)]);

const parseListXML = listXML => {
    const stack = [new Node];
    listXML.split('\n').map(v => v.match(/<.+?>/)[0]).forEach(v => {
        const attributes = Object.fromEntries(parseAttributes(v) || []);
        const isClosed = v.slice(-2) === '/>';
        const tag = v.replace(/ .*$/g, '');
        switch (tag) {
            case '<Map':
                const node = Object.assign(new Node, attributes);
                endOf(stack).children.push(node);
                if (!isClosed) {
                    stack.push(node);
                }
                break;
            case '<PC':
                endOf(stack).children.push(attributes);
                break;
            case '<Bank':
                Object.assign(endOf(endOf(stack).children), attributes);
                break;
            case '</PC>':
                break;
            case '</Map>':
                stack.pop();
                break;
        }
    });
    return stack[0];
};

export const fetchRainbowSoundFont = async () => {
    const xml = await (await fetch('https://rpgen3.github.io/rainbowSoundfont/xml/RaInBow%20SoundFont%202017.xml')).text();

    const instrumentListXML = xml.match(/<InstrumentList>(.|\n)+?<\/InstrumentList>/)[0];
    const drumSetListXML = xml.match(/<DrumSetList>(.|\n)+?<\/DrumSetList>/)[0];

    const instrumentList = parseListXML(instrumentListXML);
    const drumSetList = parseListXML(drumSetListXML);

    return {
        instrumentList: instrumentList.children.filter((_, i) => i !== 1),
        drumSetList: drumSetList.children[0].children,
    };
};
