export default class PhysicsSynchronizer {
    constructor(object, physics) {
        this.object = object;
        this.physics = physics;
    }

    init(data) {
        if (data) {
            this.object.props = data.props;
            this.physics.setObjectProps(this.object.physicsData.body, data.physics);
        } else {
            return {ns: this.object.namespace.path,
                    props: this.object.props,
                    physics: this.physics.getObjectProps(this.object.physicsData.body)};
        }
    }

    sync() {
        return null;
    }

    destroy() {

    }
}
