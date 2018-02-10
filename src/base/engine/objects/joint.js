import Object from "./object.js"

export default class Joint extends Object {
    constructor(props) {
        super(props);
    }

    renderable() {
        return false;
    }

    init(physics) {
        this.physicsData.joint = physics.createJoint(this.props);
    }

    getType() {
        return this.props.type;
    }
}
