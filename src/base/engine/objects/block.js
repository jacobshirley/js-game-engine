import PhysicsSynchronizer from "../sync/physics-object.js";

export default class Block {
    constructor(props) {
        this.props = props;
    }

    init(physics) {
        let body = physics.createBlock(this.props);

        this.physicsData = {
            body: body
        };

        this.syncer = new PhysicsSynchronizer(this, physics);
    }

    initRenderer(renderer) {
        //3d rendering

        let mesh = renderer.createBlock(this.props);

        if (mesh) {
            mesh.userData.body = this.physicsData.body;
            mesh.userData.static = this.props.mass == 0;
        }

    	this.renderData = {
    		mesh: mesh
    	};
    }

    synchronizer() {
        return this.syncer;
    }

    copy() {
        return new Block(this.props);
    }
}
