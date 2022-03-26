const uuid = require('uuid');
const path = require('path');
const {Device, DeviceInfo} = require('../models/models');
const ApiError = require('../error/ApiError');

class DeviceController {
    async create(req, res, next) {
        try {
            console.log('создаю девайс');
            let {name, price, brandId, typeId, info} = req.body;
            const {file} = req.files;
            const fileName = uuid.v4() + ".jpg";

            console.log(file);

            file.mv(path.resolve(__dirname, '..', 'static', fileName));
            console.log('check0');
            const device = await Device.create({name, price, brandId, typeId, img: fileName});

            console.log('check1');

            if (info) {
                info = JSON.parse(info);
                info.forEach(i => {
                    DeviceInfo.create({
                        title: i.name,
                        description: i.description,
                        deviceId: device.id
                    })
                })
            }

            return res.json(device);
        } catch(e) {
            next(ApiError.badRequest(e.message));
        }
    }

    async getAll(req, res) {
        let {brandId, typeId, limit, page} = req.query;
        page = page || 1;
        limit = limit || 9;
        let offset = limit * page - limit; // 9 * 2 = 18 - 9 = 9
        let devices;


        if (!brandId && !typeId) {
            devices = await Device.findAndCountAll({limit, offset});
        }
        if (brandId && !typeId) {
            devices = await Device.findAndCountAll({where: brandId, limit, offset});
        }
        if (!brandId && typeId) {
            devices = await Device.findAndCountAll({where: typeId, limit, offset});
        }
        if (brandId && typeId) {
            devices = await Device.findAndCountAll({where: {typeId, brandId}, limit, offset});
        }

        return res.json(devices);
    }

    async getOne(req, res) {
        const {id} = req.params;
        const device = await Device.findOne(
            {
                where: {id},
                include: [{model: DeviceInfo, as: 'info'}]
            },
        );

        return res.json(device);
    }
}

module.exports = new DeviceController();