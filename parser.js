class NodeMap extends Map {
    constructor(...args) {
        super(...args);
        this.set('children', []);
    }
}

const parseAttributes = str => new Map(str.match(/[^ ]+=".+?"/g)?.map(v => v.split('=')).map(([a, b]) => [a, b.slice(1, -1)]));
const endOf = array => array[array.length - 1];

const parseListXML = listXML => {
    const stack = [new NodeMap];
    listXML.split('\n').map(v => v.match(/<.+?>/)[0]).forEach(v => {
        const attributes = parseAttributes(v);
        const isClosed = v.slice(-2) === '/>';
        const tag = v.replace(/ .*$/g, '');
        switch (tag) {
            case '<Map':
                const nodeMap = new NodeMap(attributes);
                endOf(stack).get('children').push(nodeMap);
                if (!isClosed) {
                    stack.push(nodeMap);
                }
                break;
            case '<PC':
                endOf(stack).get('children').push(attributes);
                break;
            case '<Bank':
                for (const [key, value] of attributes) {
                    endOf(endOf(stack).get('children')).set(key, value);
                }
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

const instrumentListXML = xml.match(/<InstrumentList>(.|\n)+?<\/InstrumentList>/)[0];
const drumSetListXML = xml.match(/<DrumSetList>(.|\n)+?<\/DrumSetList>/)[0];

const instrumentList = parseListXML(instrumentListXML);
const drumSetList = parseListXML(drumSetListXML);
