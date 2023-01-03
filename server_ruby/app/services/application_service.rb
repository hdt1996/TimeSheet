class ApplicationService
    def self.collect(params, *args, **opts)
        return new(*args, **opts).collect(params)
    end

    def self.render(params, *args, **opts)
        return new(*args, **opts).render(params)
    end
end