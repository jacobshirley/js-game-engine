class P2PModelUpdater extends UpdateProcessor{
	constructor(networking, subupdater) {
		super(networking);

		this.subupdater = subupdater;

		this.processingClients = [];
		this.appliedUpdates = [];
		this.stoppedUpdates = [];

		this.processingClientIndex = -1;
		this.didProcess = false;

		this.clientId = -1;
	}

	preprocess() {
		this.appliedUpdates = [];
		this.stoppedUpdates = [];

		this.subupdater.preprocess();
	}

	startProcess(clientId) {
		this.clientId = clientId;
		this.processingClientIndex = this.processingClients.indexOf(clientId);
		this.didProcess = false;

		this.subupdater.startProcess(clientId);
	}

	process(update) {
		if (update.name == "APPLY") {
			if (!this.networking.isHost) {
				//console.log("got apply");
	        	let applied = update.updateMeta;
	            this.processingClients = this.processingClients.concat(applied);

	            return Networking.CONTINUE_DELETE;
	        }
		} else if (update.name == "STOP_APPLYING") {
			if (!this.networking.isHost) {
	            let toBeFinished = update.updateMeta;
	            toBeFinished.forEach((i) => {
	            	this.processingClients.splice(this.processingClients.indexOf(i), 1);
	            });
	            return Networking.CONTINUE_DELETE;
	        }
        } else {
        	this.didProcess = true;

            if (this.networking.isHost && this.processingClientIndex == -1) {
            	this.processingClientIndex = this.processingClients.length;
                this.appliedUpdates.push(this.clientId);
                this.processingClients.push(this.clientId);
            }

            return this.subupdater.process(update);
        }
        return Networking.BREAK_DELETE;
	}

	endProcess(clientId) {
		if (this.networking.isHost && !this.didProcess && this.processingClientIndex != -1) {
			this.stoppedUpdates.push(clientId);
			this.processingClients.splice(this.processingClientIndex, 1);
		}

		this.subupdater.endProcess(clientId);
	}

	postprocess() {
		let networking = this.networking;
		if (networking.isHost) {
		    if (this.appliedUpdates.length > 0)
		        networking.addUpdate({name: "APPLY", frame: networking.tick, updateMeta: this.appliedUpdates});

		    if (this.stoppedUpdates.length > 0)
		        networking.addUpdate({name: "STOP_APPLYING", frame: networking.tick, updateMeta: this.stoppedUpdates});
		} else {
			for (let client of this.processingClients) {
				networking.processUpdates(client, [this.subupdater]);
			}
		}

		this.subupdater.postprocess();
	}
}