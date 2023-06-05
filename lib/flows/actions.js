exports.init = async function (homey) {
    const action_send_data = homey.flow.getActionCard('action_send_data');
    action_send_data.registerRunListener(async (args, state) => {
        await args.device.onCapability_Send(args);
    });
};