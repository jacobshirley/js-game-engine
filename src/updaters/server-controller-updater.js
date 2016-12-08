class ServerControllerUpdater extends UpdateProcessor{
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
		if (!update.frame)
			return Networking.SKIP;

		if (update.name == "APPLY") {
			if (!this.networking.isHost) {
				console.log(update);
	        	let applied = update.updateMeta;
	            this.processingClients = this.processingClients.concat(applied);
	        }
		} else if (update.name == "STOP_APPLYING") {
			if (!this.networking.isHost) {
	            let toBeFinished = update.updateMeta;
	            toBeFinished.forEach((i) => {
	            	this.processingClients.splice(this.processingClients.indexOf(i), 1);
	            });
	        }
        } else {
        	this.didProcess = true;

            if (this.networking.isHost && this.processingClientIndex == -1) {
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
			//console.log(this.appliedUpdates.length);
		    if (this.appliedUpdates.length > 0)
		        networking.addUpdate({name: "APPLY", frame: networking.tick, updateMeta: this.appliedUpdates});

		    if (this.stoppedUpdates.length > 0)
		        networking.addUpdate({name: "STOP_APPLYING", frame: networking.tick, updateMeta: this.stoppedUpdates});
		} else {
			for (let client of this.processingClients) {
				let updates = networking.clientData[client+1].updates;
				if (updates.length > 0) {
					networking.processUpdates(updates, [this.subupdater]);
				}
			}
		}

		this.subupdater.postprocess();
	}
}